-- Create the streamers table for the Streamy page
-- Run this in your Supabase SQL editor.

create table if not exists streamers (
  id          uuid primary key default gen_random_uuid(),
  nick        text not null,
  motto       text not null default '',
  stream_url  text not null,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table streamers enable row level security;

-- Allow public read (the Streamy page is public)
create policy "Public Read"
  on streamers
  for select
  using (true);

-- Allow insert / delete for anon key (admin panel uses anon key from client)
create policy "Anon Insert"
  on streamers
  for insert
  with check (true);

create policy "Anon Delete"
  on streamers
  for delete
  using (true);
