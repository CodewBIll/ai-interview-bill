import { NextRequest, NextResponse } from 'next/server';
import {
  createSession,
  getSession,
  getAllSessions,
  updateSession,
  getMessages,
} from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const includeMessages = searchParams.get('messages') === 'true';

    if (id) {
      const session = await getSession(user.id, id);

      if (includeMessages) {
        const messages = await getMessages(user.id, id);
        return NextResponse.json({ session, messages });
      }

      return NextResponse.json(session);
    }

    const sessions = await getAllSessions(user.id);
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json(
      { error: 'Gagal mengambil data sesi' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, role, level } = body;

    if (!name || !role || !level) {
      return NextResponse.json(
        { error: 'Nama, role, dan level harus diisi' },
        { status: 400 }
      );
    }

    const session = await createSession(user.id, { name, role, level });

    return NextResponse.json(
      { sessionId: session.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Gagal membuat sesi baru' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID diperlukan' },
        { status: 400 }
      );
    }

    await updateSession(user.id, id, updateData);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Gagal mengupdate sesi' },
      { status: 500 }
    );
  }
}
