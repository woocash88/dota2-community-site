-- Add position column to streamers table for manual reordering
alter table streamers add column if not exists position int not null default 0;

-- Allow update for anon key (admin panel uses anon key from client)
create policy "Anon Update"
  on streamers
  for update
  using (true)
  with check (true);
