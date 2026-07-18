-- Drop loose anonymous access policies for writing / mutating data
-- This prevents unauthorized direct access via public anon-key Client-side Supabase client calls

-- 1. hall_of_fame_tournaments
drop policy if exists "Anon Insert" on hall_of_fame_tournaments;
drop policy if exists "Anon Update" on hall_of_fame_tournaments;
drop policy if exists "Anon Delete" on hall_of_fame_tournaments;

create policy "Admin Write Access for hall_of_fame_tournaments"
  on hall_of_fame_tournaments
  for all
  to authenticated
  using (
    (auth.jwt() ->> 'email') in ('voocash.s@gmail.com', 'wilq.wdz@gmail.com')
  )
  with check (
    (auth.jwt() ->> 'email') in ('voocash.s@gmail.com', 'wilq.wdz@gmail.com')
  );


-- 2. basher_issues
drop policy if exists "Anon Insert" on basher_issues;
drop policy if exists "Anon Delete" on basher_issues;
drop policy if exists "Anon Update" on basher_issues;

create policy "Admin Write Access for basher_issues"
  on basher_issues
  for all
  to authenticated
  using (
    (auth.jwt() ->> 'email') in ('voocash.s@gmail.com', 'wilq.wdz@gmail.com')
  )
  with check (
    (auth.jwt() ->> 'email') in ('voocash.s@gmail.com', 'wilq.wdz@gmail.com')
  );


-- 3. streamers
drop policy if exists "Anon Insert" on streamers;
drop policy if exists "Anon Delete" on streamers;
drop policy if exists "Anon Update" on streamers;

create policy "Admin Write Access for streamers"
  on streamers
  for all
  to authenticated
  using (
    (auth.jwt() ->> 'email') in ('voocash.s@gmail.com', 'wilq.wdz@gmail.com')
  )
  with check (
    (auth.jwt() ->> 'email') in ('voocash.s@gmail.com', 'wilq.wdz@gmail.com')
  );


-- 4. news
alter table news enable row level security;

drop policy if exists "Public read news" on news;
create policy "Public read news"
  on news for select
  using (true);

drop policy if exists "Admin write news" on news;
create policy "Admin write news"
  on news for all
  to authenticated
  using (
    (auth.jwt() ->> 'email') in ('voocash.s@gmail.com', 'wilq.wdz@gmail.com')
  )
  with check (
    (auth.jwt() ->> 'email') in ('voocash.s@gmail.com', 'wilq.wdz@gmail.com')
  );


-- 5. testimonials
alter table testimonials enable row level security;

drop policy if exists "Public read testimonials" on testimonials;
create policy "Public read testimonials"
  on testimonials for select
  using (true);

drop policy if exists "Admin write testimonials" on testimonials;
create policy "Admin write testimonials"
  on testimonials for all
  to authenticated
  using (
    (auth.jwt() ->> 'email') in ('voocash.s@gmail.com', 'wilq.wdz@gmail.com')
  )
  with check (
    (auth.jwt() ->> 'email') in ('voocash.s@gmail.com', 'wilq.wdz@gmail.com')
  );
