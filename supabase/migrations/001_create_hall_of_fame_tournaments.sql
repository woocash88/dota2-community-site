-- Create the hall_of_fame_tournaments table
-- Run this in your Supabase SQL editor.

create table if not exists hall_of_fame_tournaments (
  id            uuid primary key default gen_random_uuid(),
  tournament_name text not null,
  tournament_date text not null,
  tournament_id   text not null,
  dotabuff_link   text not null default '',
  players         jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

-- Enable Row Level Security
alter table hall_of_fame_tournaments enable row level security;

-- Allow public read (the Hall of Fame page is public)
create policy "Public Read"
  on hall_of_fame_tournaments
  for select
  using (true);

-- Allow insert / update / delete for anon key
-- (the admin panel uses the anon key directly from the client)
create policy "Anon Insert"
  on hall_of_fame_tournaments
  for insert
  with check (true);

create policy "Anon Update"
  on hall_of_fame_tournaments
  for update
  using (true);

create policy "Anon Delete"
  on hall_of_fame_tournaments
  for delete
  using (true);

-- Required JSONB structure for the `players` column:
-- [
--   { "name": "Miracle-",     "steam_id": 105248287, "is_substitute": false },
--   { "name": "Nisha",        "steam_id": 105960260, "is_substitute": false },
--   { "name": "Matumbaman",   "steam_id": 87278747,  "is_substitute": false },
--   { "name": "KuroKy",       "steam_id": 89136198,  "is_substitute": false },
--   { "name": "GH",           "steam_id": 92949094,  "is_substitute": false },
--   { "name": "Rezerwowy",    "steam_id": 123456789, "is_substitute": true  }
-- ]
