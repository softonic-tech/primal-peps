-- Site settings (single row) — bank, promo, social, contact
-- Run in Supabase SQL Editor after schema.sql

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  bank jsonb not null default '{}'::jsonb,
  promo jsonb not null default '{}'::jsonb,
  shipping jsonb not null default '{}'::jsonb,
  points jsonb not null default '{}'::jsonb,
  social jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  site jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings" on public.site_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_settings (
  id, bank, promo, shipping, points, social, contact, site
) values (
  1,
  '{
    "accountName": "Primal Peps",
    "bsb": "000-000",
    "accountNumber": "00000000",
    "bankName": ""
  }'::jsonb,
  '{
    "code": "PRIMAL15",
    "percent": 15
  }'::jsonb,
  '{
    "freeThreshold": 150
  }'::jsonb,
  '{
    "perDollar": 2
  }'::jsonb,
  '{
    "instagram": "",
    "facebook": "",
    "tiktok": "",
    "youtube": "",
    "x": ""
  }'::jsonb,
  '{
    "email": "hello@primalpeps.com",
    "phone": ""
  }'::jsonb,
  '{
    "tagline": "Precision compounds. Verified quality. Built for serious research.",
    "supportNote": "AU research peptides — lab tested, discrete shipping."
  }'::jsonb
)
on conflict (id) do nothing;
