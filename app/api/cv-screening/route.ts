import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import {
  createCvScreening,
  getCvScreenings,
  updateCvScreening,
} from '@/lib/db';

const n8nWebhookUrl = process.env.N8N_CV_SCREENING_WEBHOOK_URL;
const n8nWebhookSecret = process.env.N8N_CV_SCREENING_WEBHOOK_SECRET;

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const allowedExtensions = new Set(['pdf', 'doc', 'docx']);
const maxFileSize = 5 * 1024 * 1024;

function getFileExtension(fileName: string) {
  const segments = fileName.toLowerCase().split('.');
  return segments.length > 1 ? segments[segments.length - 1] : '';
}

async function parseResponsePayload(response: Response) {
  const text = await response.text();

  try {
    return text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return {
      message: text,
    };
  }
}

function extractSummary(payload: Record<string, unknown> | null) {
  if (!payload) {
    return null;
  }

  const summaryCandidate =
    payload.summary ??
    payload.resultSummary ??
    payload.message ??
    payload.result;

  return typeof summaryCandidate === 'string' ? summaryCandidate : null;
}

function extractExecutionId(payload: Record<string, unknown> | null) {
  if (!payload) {
    return null;
  }

  const executionCandidate =
    payload.executionId ?? payload.execution_id ?? payload.id;

  return typeof executionCandidate === 'string' ? executionCandidate : null;
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const screenings = await getCvScreenings(user.id);
    return NextResponse.json(screenings);
  } catch {
    return NextResponse.json(
      { error: 'Gagal mengambil riwayat screening CV' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        {
          error:
            'Webhook n8n belum dikonfigurasi. Tambahkan N8N_CV_SCREENING_WEBHOOK_URL di environment.',
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const email = formData.get('email');
    const file = formData.get('cv');

    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email screening wajib diisi.' },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'File CV wajib diunggah.' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File CV tidak boleh kosong.' },
        { status: 400 }
      );
    }

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: 'Ukuran CV maksimal 5MB.' },
        { status: 400 }
      );
    }

    const fileExtension = getFileExtension(file.name);
    const isAllowedMimeType =
      !file.type || allowedMimeTypes.has(file.type.toLowerCase());

    if (!isAllowedMimeType || !allowedExtensions.has(fileExtension)) {
      return NextResponse.json(
        { error: 'Format CV harus PDF, DOC, atau DOCX.' },
        { status: 400 }
      );
    }

    const screening = await createCvScreening(user.id, {
      email: email.trim(),
      cvFileName: file.name,
      cvFileType: file.type || null,
      cvFileSize: file.size,
    });

    const n8nPayload = new FormData();
    n8nPayload.append('screeningId', screening.id);
    n8nPayload.append('userId', user.id);
    n8nPayload.append('email', email.trim());
    n8nPayload.append('fileName', file.name);
    n8nPayload.append('fileType', file.type || '');
    n8nPayload.append('fileSize', String(file.size));
    n8nPayload.append('cv', file, file.name);

    const webhookHeaders = n8nWebhookSecret
      ? { 'x-cv-screening-secret': n8nWebhookSecret }
      : undefined;

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: webhookHeaders,
      body: n8nPayload,
    });

    const responsePayload = await parseResponsePayload(webhookResponse);

    if (!webhookResponse.ok) {
      await updateCvScreening(user.id, screening.id, {
        status: 'failed',
        error_message:
          extractSummary(responsePayload) ||
          'n8n webhook mengembalikan respons gagal.',
        response_payload: responsePayload,
      });

      return NextResponse.json(
        {
          error:
            extractSummary(responsePayload) ||
            'Gagal meneruskan CV ke pipeline screening.',
        },
        { status: 502 }
      );
    }

    const updatedScreening = await updateCvScreening(user.id, screening.id, {
      status: 'submitted',
      n8n_execution_id: extractExecutionId(responsePayload),
      result_summary: extractSummary(responsePayload),
      response_payload: responsePayload,
      error_message: null,
    });

    return NextResponse.json(
      {
        success: true,
        screening: updatedScreening,
        message:
          'CV berhasil dikirim ke pipeline screening. Hasil bisa diproses lebih lanjut di n8n.',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat mengirim CV.',
      },
      { status: 500 }
    );
  }
}
