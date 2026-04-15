# User Role & Preferences

## Role Split
- **Claude owns**: All code, all commits, all docs, Notion updates, security hygiene
- **User owns**: Product scope, pricing/brand decisions, providing credentials, final approvals on UX trade-offs

## User Preferences
- Language: English (may also use Chinese — respond in whatever language they write in)
- Works on Mac (Apple Silicon)
- Project dir: `/Volumes/MacMiniEx/Dropbox/Dropbox/Test Project Uno/quickquote-ca`
- Prefers to provide credentials themselves, Claude integrates them

## How to Resume a Session
1. Read `.claude/memory/MEMORY.md` (this index)
2. Read `project_state.md` to know current phase + what's next
3. Read `project_conventions.md` if writing code
4. Pick up without asking user to re-explain context

## Trigger Phrases (act immediately, no clarification)
- "continue" / "继续" → pick up from last session
- "check what's missing" → audit state against PLAN.md
- "record this" → update Notion
- Pasted credential → update .env.local + .env.example + confirm gitignored
- Screenshot of error → diagnose and fix
