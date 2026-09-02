-- COA documents bucket + products.coa_url
-- Run in Supabase SQL Editor after schema.sql
-- One COA is stored per product. product_variants.coa_url is kept for older rows.

alter table public.products
  add column if not exists coa_url text;

comment on column public.products.coa_url is
  'Public URL to the product COA PDF in coa-documents storage. NULL = pending.';

alter table public.product_variants
  add column if not exists coa_url text;

comment on column public.product_variants.coa_url is
  'Legacy variant COA URL. Prefer products.coa_url.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'coa-documents',
  'coa-documents',
  true,
  10485760, -- 10MB
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read COA documents" on storage.objects;
create policy "Public read COA documents"
  on storage.objects for select
  to public
  using (bucket_id = 'coa-documents');

drop policy if exists "Admins upload COA documents" on storage.objects;
create policy "Admins upload COA documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'coa-documents' and public.is_admin());

drop policy if exists "Admins update COA documents" on storage.objects;
create policy "Admins update COA documents"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'coa-documents' and public.is_admin())
  with check (bucket_id = 'coa-documents' and public.is_admin());

drop policy if exists "Admins delete COA documents" on storage.objects;
create policy "Admins delete COA documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'coa-documents' and public.is_admin());
