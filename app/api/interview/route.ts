import { NextRequest, NextResponse } from 'next/server';
import { callInterview } from '@/lib/gemini';
import { saveMessage } from '@/lib/db';
import { Message } from '@/types/interview';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { messages, role, level, name, sessionId } = body as {
      messages: Message[];
      role: string;
      level: string;
      name: string;
      sessionId: string;
    };

    // Validation
    if (!messages || !messages.length || !role || !level || !name || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save the latest user message to DB
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg?.role === 'user') {
      await saveMessage(sessionId, lastUserMsg);
    }

    // Call Gemini and get full JSON response
    const responseText = await callInterview(messages, role, level, name);

    // Validate it's parseable JSON before saving
    try {
      JSON.parse(responseText);
    } catch {
      console.error('Gemini returned non-JSON response:', responseText);
      return NextResponse.json(
        { error: 'AI mengembalikan format yang tidak valid. Coba lagi.' },
        { status: 500 }
      );
    }

    // Save AI response to DB (async, don't await)
    saveMessage(sessionId, {
      role: 'assistant',
      content: responseText,
    }).catch((err) => {
      console.error('Error saving AI message:', err);
    });

    // Return the JSON text as plain text (frontend will parse it)
    return new Response(responseText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Interview API error:', error);

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses interview' },
      { status: 500 }
    );
  }
}
