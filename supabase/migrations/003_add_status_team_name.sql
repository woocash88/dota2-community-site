-- Add status column for draft/publish workflow and team_name for Hall of Fame
-- Run this in your Supabase SQL editor.

-- news table
alter table news
  add column if not exists status text not null default 'draft';

-- hall_of_fame_tournaments table
alter table hall_of_fame_tournaments
  add column if not exists status text not null default 'draft',
  add column if not exists team_name text not null default '';

-- basher_issues table
alter table basher_issues
  add column if not exists status text not null default 'draft';
