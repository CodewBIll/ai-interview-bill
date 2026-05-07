import { createClient } from '@supabase/supabase-js';
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

// ===================== SESSION =====================

export async function createSession(
  data: Partial<InterviewSession>
): Promise<InterviewSession> {
  const { data: session, error } = await supabaseAdmin
    .from('sessions')
    .insert({
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

export async function getSession(id: string): Promise<InterviewSession> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to get session: ${error.message}`);
  return data as InterviewSession;
}

export async function getAllSessions(): Promise<InterviewSession[]> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to get sessions: ${error.message}`);
  return (data as InterviewSession[]) || [];
}

export async function updateSession(
  id: string,
  data: Partial<InterviewSession>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('sessions')
    .update(data)
    .eq('id', id);

  if (error) throw new Error(`Failed to update session: ${error.message}`);
}

// ===================== MESSAGES =====================

export async function saveMessage(
  sessionId: string,
  message: Message
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('messages')
    .insert({
      session_id: sessionId,
      role: message.role,
      content: message.content,
    });

  if (error) throw new Error(`Failed to save message: ${error.message}`);
}

export async function getMessages(sessionId: string): Promise<Message[]> {
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
  sessionId: string,
  feedback: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('sessions')
    .update({ feedback })
    .eq('id', sessionId);

  if (error) throw new Error(`Failed to save feedback: ${error.message}`);
}