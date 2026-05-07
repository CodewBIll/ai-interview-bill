-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Sessions table
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  level text not null,
  status text not null default 'in_progress',
  overall_score integer,
  final_summary text,
  avg_technical numeric(4,1),
  avg_clarity numeric(4,1),
  avg_relevance numeric(4,1),
  created_at timestamptz default now() not null
);

-- Messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now() not null
);

-- Optional: indexes for performance
create index if not exists messages_session_id_idx on messages(session_id);
create index if not exists sessions_created_at_idx on sessions(created_at desc);

-- Optional: RLS policies (if you want to use Row Level Security)
-- For development, you can disable RLS or use permissive policies:
alter table sessions enable row level security;
alter table messages enable row level security;

create policy "Allow all operations on sessions" on sessions for all using (true) with check (true);
create policy "Allow all operations on messages" on messages for all using (true) with check (true);
