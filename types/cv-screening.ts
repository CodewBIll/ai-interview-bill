export type CvScreeningStatus =
  | 'pending'
  | 'submitted'
  | 'processing'
  | 'completed'
  | 'failed';

export interface CvScreening {
  id: string;
  user_id?: string | null;
  email: string;
  cv_file_name: string;
  cv_file_type: string | null;
  cv_file_size: number;
  status: CvScreeningStatus;
  n8n_execution_id: string | null;
  result_summary: string | null;
  error_message: string | null;
  response_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}
