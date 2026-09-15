-- Peplab-style shipment tracking + idempotent email flags
alter table public.orders
  add column if not exists tracking_number text,
  add column if not exists additional_tracking_numbers jsonb not null default '[]'::jsonb,
  add column if not exists confirmation_email_sent boolean not null default false,
  add column if not exists payment_email_sent boolean not null default false,
  add column if not exists processing_email_sent boolean not null default false,
  add column if not exists shipped_email_sent boolean not null default false,
  add column if not exists delivered_email_sent boolean not null default false,
  add column if not exists cancelled_email_sent boolean not null default false;

comment on column public.orders.tracking_number is 'Primary AusPost tracking number';
comment on column public.orders.additional_tracking_numbers is 'Replacement / follow-up tracking numbers';
comment on column public.orders.shipped_email_sent is 'True after primary shipped email sent (skip duplicates)';
