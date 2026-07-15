-- Add optional link_url column to basher_issues for external links

alter table basher_issues
  add column if not exists link_url text;
