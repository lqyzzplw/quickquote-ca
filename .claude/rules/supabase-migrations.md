# Supabase Migration Rules

Rules for any project that uses Supabase + the Supabase CLI / `supabase db push`. Designed to keep local migration files, the remote `supabase_migrations.schema_migrations` table, and the GitHub Actions migration workflow in sync.

## File Naming — REQUIRED FORMAT

Migration files **must** be named:

```
supabase/migrations/<14-digit-timestamp>_<snake_case_name>.sql
```

Where the timestamp is `YYYYMMDDHHMMSS` (UTC).

✅ Good: `20260501034342_add_stripe_customer_id.sql`
❌ Bad:  `003_add_stripe_customer_id.sql`
❌ Bad:  `2026-05-01_add_stripe_customer_id.sql`

The Supabase CLI parses the leading 14 digits as the migration version. Short prefixes (`001_`, `002_`) are silently skipped by the CLI but tracked by `apply_migration` MCP calls — this divergence will break `supabase db push` later.

## Creating a New Migration

**Preferred:**
```bash
supabase migration new <descriptive_name>
```
Generates the file with a correct timestamp prefix automatically.

**Manual fallback:**
```bash
date -u +%Y%m%d%H%M%S    # use the output as the prefix
```

Timestamps **must** be strictly increasing. Never edit the prefix of an already-applied migration.

## Applying Migrations

Two paths, both write to the same `supabase_migrations.schema_migrations` table:

1. **Production (auto)** — push to `main` triggers the `Supabase Migration` GitHub Action which runs `supabase db push`.
2. **Ad-hoc / dev** — Supabase MCP `apply_migration` tool, or `supabase db push` from a linked local CLI.

When using `apply_migration` directly, **always** ensure a corresponding `<timestamp>_<name>.sql` file exists in the repo BEFORE applying — otherwise `db push` will fail on the next CI run with `Remote migration versions not found in local migrations directory`.

## Recovering from Drift

Symptoms: CI shows `Remote migration versions not found in local migrations directory` listing one or more 14-digit versions.

**Cause:** the remote `schema_migrations` table records versions that no local file matches.

**Fix:**
1. Query remote: `SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version`
2. For each unmatched version, either:
   - Rename the local file to use that exact 14-digit prefix, or
   - Mark as reverted: `supabase migration repair --status reverted <version>` (only if the schema change is truly absent or being rolled back)
3. For local files with no remote entry but whose schema is already live, INSERT a row into `schema_migrations` with the file's timestamp as version.

## Idempotency

Every DDL must be idempotent — `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`. This protects against partial application and re-runs after drift recovery.

Seed migrations should use `INSERT ... ON CONFLICT (slug) DO NOTHING` (or equivalent) for the same reason.

## Why This Exists

In April 2026 ReloScope drifted: 003/004/005 were tracked by MCP at fresh timestamps but lived as `003_*.sql` locally, breaking `supabase db push` for every commit thereafter. The webhook silently failed for ~2 weeks (no business impact only because no real paid conversions had happened yet). This rule prevents the recurrence.
