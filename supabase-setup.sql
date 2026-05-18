-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger to call handle_new_user on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Sessions table
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
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

alter table sessions
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

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
create index if not exists sessions_user_id_created_at_idx on sessions(user_id, created_at desc);

create table if not exists cv_screenings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  cv_file_name text not null,
  cv_file_type text,
  cv_file_size bigint not null,
  status text not null default 'pending'
    check (status in ('pending', 'submitted', 'processing', 'completed', 'failed')),
  n8n_execution_id text,
  result_summary text,
  error_message text,
  response_payload jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists cv_screenings_user_id_created_at_idx
  on cv_screenings(user_id, created_at desc);

grant select, insert, update, delete on table sessions to authenticated, service_role;
grant select, insert, update, delete on table messages to authenticated, service_role;
grant select, insert, update, delete on table cv_screenings to authenticated, service_role;

alter table sessions enable row level security;
alter table messages enable row level security;
alter table cv_screenings enable row level security;

drop policy if exists "Allow all operations on sessions" on sessions;
drop policy if exists "Allow all operations on messages" on messages;
drop policy if exists "Users can view their own sessions" on sessions;
drop policy if exists "Users can create their own sessions" on sessions;
drop policy if exists "Users can update their own sessions" on sessions;
drop policy if exists "Users can delete their own sessions" on sessions;
drop policy if exists "Users can view their own messages" on messages;
drop policy if exists "Users can create messages for their own sessions" on messages;
drop policy if exists "Users can view their own cv screenings" on cv_screenings;
drop policy if exists "Users can create their own cv screenings" on cv_screenings;
drop policy if exists "Users can update their own cv screenings" on cv_screenings;
drop policy if exists "Users can delete their own cv screenings" on cv_screenings;

create policy "Users can view their own sessions"
on sessions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own sessions"
on sessions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
on sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own sessions"
on sessions
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can view their own messages"
on messages
for select
to authenticated
using (
  exists (
    select 1
    from sessions
    where sessions.id = messages.session_id
      and sessions.user_id = auth.uid()
  )
);

create policy "Users can create messages for their own sessions"
on messages
for insert
to authenticated
with check (
  exists (
    select 1
    from sessions
    where sessions.id = messages.session_id
      and sessions.user_id = auth.uid()
  )
);

create policy "Users can view their own cv screenings"
on cv_screenings
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own cv screenings"
on cv_screenings
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own cv screenings"
on cv_screenings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own cv screenings"
on cv_screenings
for delete
to authenticated
using (auth.uid() = user_id);

-- For existing projects with legacy rows, backfill `user_id` first, then harden:
-- alter table sessions alter column user_id set not null;
