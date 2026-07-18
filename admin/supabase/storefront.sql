-- Storefront extras — run after schema.sql
-- Profiles + reviews for customer auth / account dashboard

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text not null default '',
  shipping jsonb not null default '{}'::jsonb,
  points int not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text not null default '',
  rating int not null check (rating between 1 and 5),
  body text not null default '',
  order_id text references public.orders (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists reviews_product_id_idx on public.reviews (product_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup (+ confirm email so storefront can sign in)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = new.id;

  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'user'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public read reviews" on public.reviews;
create policy "Public read reviews" on public.reviews
  for select to anon, authenticated
  using (true);

drop policy if exists "Users insert own reviews" on public.reviews;
create policy "Users insert own reviews" on public.reviews
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users delete own reviews" on public.reviews;
create policy "Users delete own reviews" on public.reviews
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage reviews" on public.reviews;
create policy "Admins manage reviews" on public.reviews
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Allow customers to update their own pending order notes is not needed;
-- Allow authenticated users to insert orders with their user_id
-- (already covered by anyone insert)
