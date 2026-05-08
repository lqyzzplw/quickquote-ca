# Supabase Project Isolation Rules

A single Supabase access token typically covers every project in an org. The MCP `apply_migration` / `execute_sql` tools take a `project_id` parameter, so a one-character typo or stale memory can write to the wrong database silently. This rule prevents that.

## The Rule — verify before every write

Before ANY of these MCP calls:
- `mcp__*supabase*__apply_migration`
- `mcp__*supabase*__execute_sql` (when the SQL contains `INSERT`, `UPDATE`, `DELETE`, `ALTER`, `CREATE`, `DROP`, or `GRANT`)
- `mcp__*supabase*__deploy_edge_function`
- `mcp__*supabase*__create_branch` / `merge_branch` / `reset_branch`
- `mcp__*supabase*__pause_project` / `restore_project` / `confirm_cost`

Claude **must** confirm `project_id` matches the current repo's expected Supabase project. Verification path, in order of preference:

1. **Repo memory file** — if `~/.claude/projects/<repo>/memory/project_state.md` (or equivalent) pins a Supabase project ID, use that. Refuse the call if `project_id` differs.
2. **Local `.env` / `.env.local`** — extract the `vfessonkchoyqxzhpehs` segment from `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`). The path `https://<id>.supabase.co` always exposes the project ref.
3. **Last resort** — call `list_projects` and ask the user which one to target. Do not guess from project name alone (multiple projects can have similar names across orgs).

If the verified ID disagrees with what was about to be passed, STOP and report the mismatch to the user before proceeding.

## Read-only calls

Pure-read calls (`SELECT` only via `execute_sql`, `list_*`, `get_*`, `search_docs`, `generate_typescript_types`) do not require this verification — at worst they leak data into the wrong session, and the user can correct course. Save the strict check for writes.

## Multi-project sessions

If a session genuinely needs to touch two projects (e.g. cross-project audit, migrating data), Claude must:
1. Announce both project IDs to the user before the first cross-project call.
2. Use a unique variable / label for each (`reloscope_id` vs `quickquote_id`), not just the raw string.
3. Re-verify against the cwd before each call, since context window drift makes string-level matching unreliable.

## Memory file convention

Every Supabase-using repo's `memory/project_state.md` (or top-level CLAUDE.md) should contain:

```
**Supabase project:** `<14-char-ref>` (<region>) — <hosted|self-hosted>.
NEVER pass any other project_id to apply_migration / execute_sql while in this repo.
Other known projects in the same org: <ref1>, <ref2>, ...
```

The "other known projects" line is the single highest-leverage line for collision avoidance — it forces explicit recognition that there's >1 project the token can reach.

## Why This Exists

In April 2026, while applying ReloScope's `005_add_user_profile_fields` migration, the `apply_migration` MCP call was made with QuickQuote's project_id by mistake. The migration ran successfully against the wrong DB, leaving 6 polluting `schema_migrations` rows in QuickQuote that had no corresponding local file. Discovered ~2 weeks later during a separate drift recovery. Same Supabase access token, same org, no isolation = no friction = silent corruption.

This rule turns project ID into a checked invariant rather than a free parameter.
