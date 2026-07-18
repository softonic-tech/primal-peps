-- Primal Peps Admin — Supabase schema
-- Run this in the Supabase SQL Editor (Project → SQL → New query)

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admin allow-list (email must match a Supabase Auth user)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  name text not null,
  aka text[] not null default '{}',
  sub text not null default '',
  tag text not null default '',
  cat text not null default 'metabolic',
  category_label text not null default '',
  cas text,
  mw text not null default '',
  lot text not null default '',
  form text not null default 'Lyophilised powder',
  purity text not null default '99%+',
  storage_lyophilised text not null default '-20 °C — protect from light & moisture',
  storage_reconstituted text not null default '2–8 °C — use within 28 days',
  reconstitution text not null default 'Bacteriostatic water (recommended)',
  composition jsonb not null default '[]'::jsonb,
  perks text[] not null default '{}',
  research_focus text[] not null default '{}',
  description text not null default '',
  story text not null default '',
  hue text not null default '#e8a020',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products (id) on delete cascade,
  variant_key text not null,
  label text not null,
  price numeric(10, 2) not null check (price >= 0),
  img text not null default '',
  stock int not null default 100 check (stock >= 0),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, variant_key)
);

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create type public.order_status as enum (
  'Awaiting payment',
  'Payment received',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled'
);

create table if not exists public.orders (
  id text primary key,
  status public.order_status not null default 'Awaiting payment',
  payment_method text not null default 'bank_transfer',
  customer_email text not null,
  customer_name text not null default '',
  customer_phone text not null default '',
  shipping jsonb not null default '{}'::jsonb,
  subtotal numeric(10, 2) not null default 0,
  shipping_fee numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  points_earned int not null default 0,
  notes text not null default '',
  admin_notes text not null default '',
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  product_id text,
  name text not null,
  variant_label text not null default '',
  qty int not null check (qty > 0),
  price numeric(10, 2) not null check (price >= 0),
  img text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin check helper
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
       or lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Admin users: admins can read their row
drop policy if exists "admins read self" on public.admin_users;
create policy "admins read self" on public.admin_users
  for select to authenticated
  using (public.is_admin());

-- Products: public read active; admins full CRUD
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products
  for select to anon, authenticated
  using (active = true or public.is_admin());

drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "public read active variants" on public.product_variants;
create policy "public read active variants" on public.product_variants
  for select to anon, authenticated
  using (
    active = true
    or public.is_admin()
  );

drop policy if exists "admins manage variants" on public.product_variants;
create policy "admins manage variants" on public.product_variants
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Orders: customers can insert/read own; admins manage all
drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders" on public.orders
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders" on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "anyone insert orders" on public.orders;
create policy "anyone insert orders" on public.orders
  for insert to anon, authenticated
  with check (true);

drop policy if exists "admins manage order items" on public.order_items;
create policy "admins manage order items" on public.order_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "users read own order items" on public.order_items;
create policy "users read own order items" on public.order_items
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "anyone insert order items" on public.order_items;
create policy "anyone insert order items" on public.order_items
  for insert to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- After creating an Auth user in Supabase Dashboard, link them as admin:
--   insert into public.admin_users (user_id, email)
--   values ('USER_UUID', 'you@example.com');
-- Or by email only first, then update user_id after signup.
-- ---------------------------------------------------------------------------
