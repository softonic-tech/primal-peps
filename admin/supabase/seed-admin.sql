-- =============================================================================
-- Create an admin allow-list row
-- =============================================================================
-- The error you saw happens when user_id is a fake UUID that does not exist
-- in auth.users (e.g. 00000000-0000-0000-0000-000000000000).
--
-- Do this instead:
--
-- STEP A — Create the login user in Supabase Dashboard
--   Authentication → Users → Add user
--   Email: admin@primalpeps.com  (or yours)
--   Password: (set one)
--   Auto Confirm User: ON
--
-- STEP B — Pick ONE of the options below
-- =============================================================================

-- OPTION 1 (simplest): allow by email only — user_id can stay null
-- Admin login still works because is_admin() matches JWT email.
insert into public.admin_users (email)
values ('admin@primalpeps.com')
on conflict (email) do nothing;

-- OPTION 2 (recommended): link the real Auth UUID
-- 1) Authentication → Users → click your user → copy "User UID"
-- 2) Paste it below (replace BOTH the UUID and email if different)

-- insert into public.admin_users (user_id, email)
-- values (
--   'PASTE-REAL-USER-UUID-HERE',
--   'admin@primalpeps.com'
-- )
-- on conflict (email) do update
-- set user_id = excluded.user_id;

-- Helper: list Auth users so you can copy the real id
-- select id, email, created_at from auth.users order by created_at desc;
