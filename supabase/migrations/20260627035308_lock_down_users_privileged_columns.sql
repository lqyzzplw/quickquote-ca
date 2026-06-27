-- Migration: lock_down_users_privileged_columns
-- Fixes C1 (see docs/analysis/2026-06-26-code-audit.md).
--
-- Problem: public.users RLS UPDATE policy is `using (auth.uid() = id)` with NO `with check`,
-- and the `authenticated` role holds table-wide UPDATE. A logged-in user can therefore set
-- their own `plan = 'pro'` (and reset `quotes_sent_this_month`) directly via PostgREST,
-- bypassing Stripe entirely.
--
-- Fix: entitlement/quota/stripe columns must be writable ONLY by service_role — which the
-- Stripe webhook and the quote-send route already use (admin client). Replace the blanket
-- UPDATE grant with a column-scoped grant covering just the profile fields the app edits
-- from the browser (settings: name, business_name, province; onboarding: business_name,
-- province; logo_url reserved for future logo upload).
--
-- GRANT/REVOKE are idempotent — safe to re-run.

-- 1) authenticated: drop blanket UPDATE, re-grant only profile columns.
revoke update on table public.users from authenticated;
grant update (name, business_name, logo_url, province) on table public.users to authenticated;

-- 2) anon: never writes to users (RLS already blocks it; this is defense-in-depth / least privilege).
revoke insert, update, delete on table public.users from anon;

-- Verify after apply (should now FAIL for a normal logged-in user):
--   update public.users set plan = 'pro' where id = auth.uid();
--   -- expected: "permission denied for column plan" (or 0 rows affected via PostgREST)
