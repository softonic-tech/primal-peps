-- TikTok UGC reward entitlements: admin approves email → customer redeems once at checkout.

create table if not exists public.tiktok_rewards (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  user_id uuid references auth.users (id) on delete set null,
  percent int not null default 50
    check (percent > 0 and percent <= 90),
  status text not null default 'approved'
    check (status in ('approved', 'redeemed', 'revoked')),
  tiktok_url text,
  notes text,
  approved_by text,
  approved_at timestamptz not null default now(),
  redeemed_order_id text,
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tiktok_rewards_email_idx
  on public.tiktok_rewards (lower(customer_email));

create index if not exists tiktok_rewards_status_idx
  on public.tiktok_rewards (status, approved_at desc);

-- One unused approval per email at a time
create unique index if not exists tiktok_rewards_one_approved_email
  on public.tiktok_rewards (lower(customer_email))
  where status = 'approved';

drop trigger if exists tiktok_rewards_set_updated_at on public.tiktok_rewards;
create trigger tiktok_rewards_set_updated_at
  before update on public.tiktok_rewards
  for each row execute function public.set_updated_at();

alter table public.tiktok_rewards enable row level security;

drop policy if exists "Admins manage tiktok rewards" on public.tiktok_rewards;
create policy "Admins manage tiktok rewards" on public.tiktok_rewards
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on table public.tiktok_rewards is
  'Admin-approved TikTok UGC discounts. Customer redeems once via checkout promo code.';

-- Lookup an unused approved entitlement for this email / user.
create or replace function public.get_tiktok_reward_entitlement(
  p_email text default null,
  p_user_id uuid default null
)
returns table (
  id uuid,
  percent int,
  customer_email text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  v_email := lower(trim(both from coalesce(p_email, '')));

  if v_email = '' and p_user_id is null then
    return;
  end if;

  return query
  select r.id, r.percent, r.customer_email
  from public.tiktok_rewards r
  where r.status = 'approved'
    and (
      (v_email <> '' and lower(trim(both from r.customer_email)) = v_email)
      or (p_user_id is not null and r.user_id = p_user_id)
    )
  order by r.approved_at desc
  limit 1;
end;
$$;

revoke all on function public.get_tiktok_reward_entitlement(text, uuid) from public;
grant execute on function public.get_tiktok_reward_entitlement(text, uuid) to anon, authenticated;

-- Mark entitlement redeemed after a successful order (email must match).
create or replace function public.redeem_tiktok_reward(
  p_reward_id uuid,
  p_email text,
  p_order_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_updated int;
begin
  v_email := lower(trim(both from coalesce(p_email, '')));
  if p_reward_id is null or v_email = '' or coalesce(trim(both from p_order_id), '') = '' then
    return false;
  end if;

  update public.tiktok_rewards r
  set
    status = 'redeemed',
    redeemed_order_id = trim(both from p_order_id),
    redeemed_at = now(),
    updated_at = now()
  where r.id = p_reward_id
    and r.status = 'approved'
    and lower(trim(both from r.customer_email)) = v_email;

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

revoke all on function public.redeem_tiktok_reward(uuid, text, text) from public;
grant execute on function public.redeem_tiktok_reward(uuid, text, text) to anon, authenticated;

comment on function public.get_tiktok_reward_entitlement(text, uuid) is
  'Returns the latest approved unused TikTok reward for an email or user_id.';

comment on function public.redeem_tiktok_reward(uuid, text, text) is
  'Marks a TikTok reward as redeemed for the matching customer email.';
