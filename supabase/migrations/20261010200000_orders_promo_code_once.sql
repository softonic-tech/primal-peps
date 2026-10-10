-- Store which promo was used on an order, and expose a safe check for one-time codes.

alter table public.orders
  add column if not exists promo_code text;

create index if not exists orders_promo_code_email_idx
  on public.orders (promo_code, lower(customer_email));

create index if not exists orders_promo_code_user_idx
  on public.orders (promo_code, user_id);

comment on column public.orders.promo_code is
  'Welcome / checkout promo code applied to this order (uppercase). Null when none.';

-- True when this email or user already used the given promo on a prior order.
create or replace function public.has_used_promo_code(
  p_code text,
  p_email text default null,
  p_user_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_email text;
begin
  v_code := upper(trim(both from coalesce(p_code, '')));
  v_email := lower(trim(both from coalesce(p_email, '')));

  if v_code = '' then
    return false;
  end if;

  if v_email = '' and p_user_id is null then
    return false;
  end if;

  return exists (
    select 1
    from public.orders o
    where upper(trim(both from coalesce(o.promo_code, ''))) = v_code
      and (
        (p_user_id is not null and o.user_id = p_user_id)
        or (
          v_email <> ''
          and lower(trim(both from coalesce(o.customer_email, ''))) = v_email
        )
      )
  );
end;
$$;

revoke all on function public.has_used_promo_code(text, text, uuid) from public;
grant execute on function public.has_used_promo_code(text, text, uuid) to anon, authenticated;

comment on function public.has_used_promo_code(text, text, uuid) is
  'Returns true if the promo code was already used by this email or user_id.';

-- Optional one-time backfill for codes used before promo_code existed.
-- Run manually after confirming the live welcome code (e.g. PRIMAL10):
-- update public.orders
-- set promo_code = 'PRIMAL10'
-- where promo_code is null
--   and coalesce(discount, 0) > 0
--   and lower(coalesce(status, '')) <> 'cancelled';
