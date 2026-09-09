-- Payment reminders via Supabase Edge Function + pg_cron (free-plan friendly)
-- =============================================================================
-- SETUP ORDER
-- A) Deploy edge function from repo root:
--      npx supabase login
--      npx supabase link --project-ref pyccunarqluxmmhczwsk
--      npx supabase secrets set RESEND_API_KEY=re_xxx "RESEND_FROM=Primal Peps <orders@primalpeps.shop>" PAYMENT_REMINDER_HOURS=4
--      npx supabase functions deploy payment-reminders --no-verify-jwt
-- B) Run sections 1–3 below in Supabase SQL Editor
-- =============================================================================

-- 1) Column used so each unpaid order only gets one reminder
alter table public.orders
  add column if not exists payment_reminder_sent_at timestamptz;

comment on column public.orders.payment_reminder_sent_at is
  'When the unpaid PayID reminder email was sent. NULL = not reminded yet.';

create index if not exists orders_payment_reminder_idx
  on public.orders (status, created_at)
  where payment_reminder_sent_at is null;

-- 2) Extensions for scheduled HTTP calls
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

-- 3) Vault secrets for the cron job (run once)
-- Replace YOUR_SERVICE_ROLE_KEY with Project Settings → API → service_role
select vault.create_secret(
  'https://pyccunarqluxmmhczwsk.supabase.co',
  'project_url',
  'Supabase project URL for payment-reminders cron'
);

select vault.create_secret(
  'YOUR_SERVICE_ROLE_KEY',
  'service_role_key',
  'Service role key for payment-reminders cron'
);

-- 4) Hourly schedule (UTC). Reminder email itself waits PAYMENT_REMINDER_HOURS (default 4).
select cron.unschedule(jobid)
from cron.job
where jobname = 'payment-reminders-hourly';

select cron.schedule(
  'payment-reminders-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := (
      select decrypted_secret from vault.decrypted_secrets where name = 'project_url'
    ) || '/functions/v1/payment-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
  $$
);

-- Checks:
-- select jobid, jobname, schedule, active from cron.job;
-- select * from cron.job_run_details order by start_time desc limit 20;
