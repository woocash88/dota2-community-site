-- Create the basher_issues table for the community magazine "Basher"
-- Run this in your Supabase SQL editor.

create table if not exists basher_issues (
  id            uuid primary key default gen_random_uuid(),
  issue_number  integer not null,
  title         text not null,
  publish_date  text not null default '',
  pages         jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

-- Enable Row Level Security
alter table basher_issues enable row level security;

-- Allow public read (the Basher page is public)
create policy "Public Read"
  on basher_issues
  for select
  using (true);

-- Allow insert / delete for anon key (admin panel uses anon key from client)
create policy "Anon Insert"
  on basher_issues
  for insert
  with check (true);

create policy "Anon Delete"
  on basher_issues
  for delete
  using (true);
