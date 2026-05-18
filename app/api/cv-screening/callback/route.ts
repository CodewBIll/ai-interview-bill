import { NextRequest, NextResponse } from 'next/server';

import { updateCvScreeningById } from '@/lib/db';

const callbackSecret = process.env.N8N_CV_SCREENING_CALLBACK_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (callbackSecret) {
      const providedSecret = req.headers.get('x-cv-screening-callback-secret');

      if (providedSecret !== callbackSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = (await req.json()) as {
      screeningId?: string;
      status?: 'processing' | 'completed' | 'failed';
      executionId?: string;
      summary?: string;
      error?: string;
      payload?: Record<string, unknown>;
    };

    if (!body.screeningId) {
      return NextResponse.json(
        { error: 'screeningId wajib diisi.' },
        { status: 400 }
      );
    }

    const screening = await updateCvScreeningById(body.screeningId, {
      status: body.status,
      n8n_execution_id: body.executionId ?? null,
      result_summary: body.summary ?? null,
      error_message: body.error ?? null,
      response_payload: body.payload ?? null,
    });

    return NextResponse.json({ success: true, screening });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat memperbarui hasil screening.',
      },
      { status: 500 }
    );
  }
}
