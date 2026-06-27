-- Migration: add_ai_parse_rate_limit
-- M4 (see docs/analysis/2026-06-26-code-audit.md): per-user daily cap on AI parse
-- calls so a logged-in user can't drain the Anthropic budget. These columns are
-- bumped ONLY by the service-role admin client in /api/ai/parse. Idempotent.

alter table public.users add column if not exists ai_parses_today int not null default 0;
alter table public.users add column if not exists ai_parses_date date;
