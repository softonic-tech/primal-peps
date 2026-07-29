-- Newsletter / welcome-offer email captures — run in Supabase SQL Editor
-- Re-run this whole file if you already created the table (safe / idempotent).
-- Allows anonymous + authenticated inserts; admins can read all rows.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'unknown',
  created_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_key unique (email)
);

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

-- Table privileges (RLS alone is not enough)
grant usage on schema public to anon, authenticated;
grant insert on table public.newsletter_subscribers to anon, authenticated;
grant select on table public.newsletter_subscribers to authenticated;

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe" on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins read subscribers" on public.newsletter_subscribers;
create policy "Admins read subscribers" on public.newsletter_subscribers
  for select
  to authenticated
  using (public.is_admin());
