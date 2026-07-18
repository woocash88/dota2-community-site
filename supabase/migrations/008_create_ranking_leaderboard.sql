create table ranking_leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  leaderboard_rank integer,
  steam_id text unique,
  avatar text,
  is_official_leaderboard boolean not null default false,
  is_registered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for looking up by leaderboard_rank (used during OpenDota merge)
create index idx_ranking_leaderboard_rank on ranking_leaderboard (leaderboard_rank) where steam_id is null;

-- Index for looking up by name (used during cron sync)
create index idx_ranking_leaderboard_name on ranking_leaderboard (name);

-- Index for finding stale official entries (used during cron cleanup)
create index idx_ranking_leaderboard_official on ranking_leaderboard (is_official_leaderboard) where is_official_leaderboard = true;

-- RLS: allow anon reads (public ranking table), restrict writes to service role
alter table ranking_leaderboard enable row level security;

create policy "Public read access for ranking_leaderboard"
  on ranking_leaderboard for select
  using (true);

create policy "Service role full access for ranking_leaderboard"
  on ranking_leaderboard for all
  using (true)
  with check (true);
