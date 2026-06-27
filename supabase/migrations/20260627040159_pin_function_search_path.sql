-- Migration: pin_function_search_path
-- Fixes L1 (see docs/analysis/2026-06-26-code-audit.md).
-- next_quote_number() is SECURITY DEFINER but did not pin search_path. Internal refs are
-- already schema-qualified (public.quote_number_seq) so practical risk is low, but pinning
-- search_path is the Supabase-advisor-recommended hardening for SECURITY DEFINER functions.
-- CREATE OR REPLACE is idempotent.

create or replace function public.next_quote_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('public.quote_number_seq');
  return 'QQ-' || lpad(seq_val::text, 4, '0');
end;
$$;
