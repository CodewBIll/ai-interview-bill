export interface InterviewSession {
  id: string;
  user_id?: string | null;
  name: string;
  role: string;
  level: string;
  status: 'in_progress' | 'completed';
  overall_score: number | null;
  final_summary: string | null;
  avg_technical: number | null;
  avg_clarity: number | null;
  avg_relevance: number | null;
  created_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ScoreMetrics {
  technical: number;
  clarity: number;
  relevance: number;
}

export interface Feedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  scores: ScoreMetrics;
}

export interface ClaudeResponse {
  qn: number;
  question: string | null;
  feedback: Feedback | null;
  done: boolean;
  final?: string;
  total?: number;
}
