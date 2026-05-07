import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hzlepjmtrlakmqhaqwyq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bGVwam10cmxha21xaGFxd3lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA0NzY2MSwiZXhwIjoyMDkzNjIzNjYxfQ.m4DkJBy4VnJH7bSj6g--Et6kRuczu8jsD46QduwNnPs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('Testing with service role key...');

const { data, error } = await supabase
  .from('sessions')
  .insert({ name: 'Test User', role: 'Backend Engineer', level: 'Junior', status: 'in_progress' })
  .select()
  .single();

if (error) {
  console.error('ERROR:', JSON.stringify(error, null, 2));
} else {
  console.log('SUCCESS - session created:', data.id);
  await supabase.from('sessions').delete().eq('id', data.id);
  console.log('Cleaned up');
}
