import { NextRequest, NextResponse } from 'next/server';
import {
  createSession,
  getSession,
  getAllSessions,
  updateSession,
  getMessages,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const includeMessages = searchParams.get('messages') === 'true';

    if (id) {
      const session = await getSession(id);

      if (includeMessages) {
        const messages = await getMessages(id);
        return NextResponse.json({ session, messages });
      }

      return NextResponse.json(session);
    }

    const sessions = await getAllSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data sesi' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, level } = body;

    if (!name || !role || !level) {
      return NextResponse.json(
        { error: 'Nama, role, dan level harus diisi' },
        { status: 400 }
      );
    }

    const session = await createSession({ name, role, level });

    return NextResponse.json(
      { sessionId: session.id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal membuat sesi baru' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID diperlukan' },
        { status: 400 }
      );
    }

    await updateSession(id, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengupdate sesi' },
      { status: 500 }
    );
  }
}