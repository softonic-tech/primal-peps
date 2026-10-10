-- Public order tracking: match order id + checkout email (anti-enumeration).
-- Returns NULL when the pair does not match.

create or replace function public.track_order(p_order_number text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text;
  v_email text;
  v_order public.orders%rowtype;
  v_items jsonb;
begin
  v_id := upper(trim(both from coalesce(p_order_number, '')));
  v_id := regexp_replace(v_id, '^#', '');
  v_email := lower(trim(both from coalesce(p_email, '')));

  if v_id = '' or v_email = '' then
    return null;
  end if;

  select *
  into v_order
  from public.orders
  where upper(id) = v_id
    and lower(trim(both from coalesce(customer_email, ''))) = v_email
  limit 1;

  if not found then
    return null;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'name', i.name,
        'variant_label', coalesce(i.variant_label, ''),
        'qty', i.qty,
        'price', i.price,
        'is_free', coalesce(i.price, 0) = 0
      )
      order by i.name
    ),
    '[]'::jsonb
  )
  into v_items
  from public.order_items i
  where i.order_id = v_order.id;

  return jsonb_build_object(
    'order_number', v_order.id,
    'status', v_order.status,
    'created_at', v_order.created_at,
    'tracking_number', v_order.tracking_number,
    'shipping_method', coalesce(v_order.shipping->>'method', null),
    'subtotal', v_order.subtotal,
    'shipping_fee', v_order.shipping_fee,
    'discount', coalesce(v_order.discount, 0),
    'total', v_order.total,
    'items', v_items
  );
end;
$$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

comment on function public.track_order(text, text) is
  'Customer order lookup by order id + checkout email. Returns null on mismatch.';
