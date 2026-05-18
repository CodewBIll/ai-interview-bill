import { createClient } from '@supabase/supabase-js';
import { CvScreening, CvScreeningStatus } from '@/types/cv-screening';
import { InterviewSession, Message } from '@/types/interview';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client — bypasses RLS, used for all server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function assertSessionOwnership(
  userId: string,
  sessionId: string
): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify session ownership: ${error.message}`);
  }

  if (!data) {
    throw new Error('Session not found');
  }
}

async function assertCvScreeningOwnership(
  userId: string,
  screeningId: string
): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('cv_screenings')
    .select('id')
    .eq('id', screeningId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify CV screening ownership: ${error.message}`);
  }

  if (!data) {
    throw new Error('CV screening not found');
  }
}

// ===================== SESSION =====================

export async function createSession(
  userId: string,
  data: Partial<InterviewSession>
): Promise<InterviewSession> {
  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .insert({
      user_id: userId,
      name: data.name,
      role: data.role,
      level: data.level,
      status: 'in_progress',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return session as InterviewSession;
}

export async function getSession(
  userId: string,
  id: string
): Promise<InterviewSession> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(`Failed to get session: ${error.message}`);
  if (!data) throw new Error('Session not found');
  return data as InterviewSession;
}

export async function getAllSessions(userId: string): Promise<InterviewSession[]> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to get sessions: ${error.message}`);
  return (data as InterviewSession[]) || [];
}

export async function updateSession(
  userId: string,
  id: string,
  data: Partial<InterviewSession>
): Promise<void> {
  const { data: updated, error } = await supabaseAdmin
    .from('sessions')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();

  if (error) throw new Error(`Failed to update session: ${error.message}`);
  if (!updated) throw new Error('Session not found');
}

// ===================== MESSAGES =====================

export async function saveMessage(
  userId: string,
  sessionId: string,
  message: Message
): Promise<void> {
  await assertSessionOwnership(userId, sessionId);

  const { error } = await supabaseAdmin
    .from('messages')
    .insert({
      session_id: sessionId,
      role: message.role,
      content: message.content,
    });

  if (error) throw new Error(`Failed to save message: ${error.message}`);
}

export async function getMessages(
  userId: string,
  sessionId: string
): Promise<Message[]> {
  await assertSessionOwnership(userId, sessionId);

  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to get messages: ${error.message}`);
  return (data as Message[]) || [];
}


// ===================== FEEDBACK =====================

export async function saveFeedback(
  userId: string,
  sessionId: string,
  feedback: string
): Promise<void> {
  const { data: updated, error } = await supabaseAdmin
    .from('sessions')
    .update({ feedback })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();

  if (error) throw new Error(`Failed to save feedback: ${error.message}`);
  if (!updated) throw new Error('Session not found');
}

// ===================== CV SCREENING =====================

export async function createCvScreening(
  userId: string,
  data: {
    email: string;
    cvFileName: string;
    cvFileType: string | null;
    cvFileSize: number;
  }
): Promise<CvScreening> {
  const { data: screening, error } = await supabaseAdmin
    .from('cv_screenings')
    .insert({
      user_id: userId,
      email: data.email,
      cv_file_name: data.cvFileName,
      cv_file_type: data.cvFileType,
      cv_file_size: data.cvFileSize,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create CV screening: ${error.message}`);
  }

  return screening as CvScreening;
}

export async function getCvScreenings(userId: string): Promise<CvScreening[]> {
  const { data, error } = await supabaseAdmin
    .from('cv_screenings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get CV screenings: ${error.message}`);
  }

  return (data as CvScreening[]) || [];
}

export async function updateCvScreening(
  userId: string,
  screeningId: string,
  data: Partial<CvScreening>
): Promise<CvScreening> {
  await assertCvScreeningOwnership(userId, screeningId);

  const payload = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: screening, error } = await supabaseAdmin
    .from('cv_screenings')
    .update(payload)
    .eq('id', screeningId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update CV screening: ${error.message}`);
  }

  return screening as CvScreening;
}

export async function updateCvScreeningById(
  screeningId: string,
  data: {
    status?: CvScreeningStatus;
    n8n_execution_id?: string | null;
    result_summary?: string | null;
    error_message?: string | null;
    response_payload?: Record<string, unknown> | null;
  }
): Promise<CvScreening> {
  const payload = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: screening, error } = await supabaseAdmin
    .from('cv_screenings')
    .update(payload)
    .eq('id', screeningId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update CV screening by id: ${error.message}`);
  }

  return screening as CvScreening;
}
