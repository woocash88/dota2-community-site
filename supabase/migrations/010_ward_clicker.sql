-- Ward Clicker: global counter for ward clicks

create table if not exists global_counters (
  id text primary key,
  value bigint not null default 0
);

insert into global_counters (id, value)
values ('ward_clicks', 0)
on conflict (id) do nothing;

alter table global_counters enable row level security;

-- Anyone (including anonymous users) can read the counter
create policy "Public read global_counters"
  on global_counters for select
  using (true);

-- Safe +1 increment: security definer bypasses RLS, so anon users can
-- increment by exactly 1 via RPC but can never write arbitrary values directly
create or replace function increment_ward_clicks()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_value bigint;
begin
  update global_counters
  set value = value + 1
  where id = 'ward_clicks'
  returning value into new_value;

  return new_value;
end;
$$;

grant execute on function increment_ward_clicks() to anon, authenticated;
