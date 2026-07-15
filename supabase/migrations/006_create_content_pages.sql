-- Content management pages for dynamic CMS (Rekrutacja, O nas, Polityka Prywatności)
create table content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null default '',
  updated_at timestamptz default now()
);

-- Enable RLS but allow service role full access
alter table content_pages enable row level security;

create policy "Service role can manage content pages"
  on content_pages
  for all
  to service_role
  using (true)
  with check (true);

-- Allow anon read access (for public page rendering)
create policy "Anyone can view content pages"
  on content_pages
  for select
  to anon
  using (true);

-- Seed initial pages
insert into content_pages (slug, title, content) values
  ('rekrutacja', 'Rekrutacja', 'Treść rekrutacji pojawi się wkrótce.'),
  ('o-nas', 'O nas', 'Treść strony o nas pojawi się wkrótce.'),
  ('polityka-prywatnosci', 'Polityka Prywatności', 'Treść polityki prywatności pojawi się wkrótce.');
