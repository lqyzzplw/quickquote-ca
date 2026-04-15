-- Migration: 002_quote_number_function
-- Applied: 2026-04-15

create or replace function public.next_quote_number()
returns text
language plpgsql
security definer
as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('public.quote_number_seq');
  return 'QQ-' || lpad(seq_val::text, 4, '0');
end;
$$;
