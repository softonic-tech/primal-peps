-- One COA per product (not per variant)
-- Run in Supabase SQL Editor after coa-documents.sql

alter table public.products
  add column if not exists coa_url text;

comment on column public.products.coa_url is
  'Public URL to the product COA PDF in coa-documents storage. NULL = pending.';

-- Copy the first non-empty variant COA onto each product that does not have one yet
update public.products p
set coa_url = s.coa_url
from (
  select distinct on (product_id) product_id, coa_url
  from public.product_variants
  where coa_url is not null and btrim(coa_url) <> ''
  order by product_id, sort_order, created_at
) s
where p.id = s.product_id
  and (p.coa_url is null or btrim(p.coa_url) = '');
