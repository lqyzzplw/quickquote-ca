# Project State

## Current Phase
**Phase 2 — AI + Quote Engine** ✅ Complete (2026-04-15)
**Next: Phase 3 — PDF Generation + Email + Send flow**

## Overall Progress
| Phase | Status | % |
|-------|--------|---|
| 0 — Scaffold | ✅ Done | 100% |
| 1 — Auth + Profile + Clients | ✅ Done | 100% |
| 2 — AI + Quote Engine + Tax | ✅ Done | 100% |
| 3 — PDF + Email + Dashboard | ⬜ Not Started | 0% |
| 4 — Stripe + Landing + Beta | ⬜ Not Started | 0% |
| 5 — Launch | ⬜ Not Started | 0% |

## Last Session (2026-04-15)
- Credentials wired into .env.local (Supabase, Anthropic, Resend)
- DB migration 002: next_quote_number() RPC applied
- Phase 2 shipped: AI parse endpoint, quote creation flow, quotes list, quote detail
- Build passes clean — 16 static pages generated
- Pushed to GitHub (3 commits total)

## What's Next (Phase 3)
1. `/api/quotes/[id]/send` route — generate PDF + send via Resend
2. PDF template with @react-pdf/renderer (logo, line items, tax, quote number)
3. `/quotes/[id]/send` preview page
4. Wire "Send to Client" button on quote detail page
5. Update quote status to "sent" + record sent_at timestamp
6. Increment quotes_sent_this_month counter for freemium gate

## Notes
- Google OAuth not yet configured (user chose email-only for now)
- Stripe keys still pending (needed for Phase 4)
- react-pdf v3.4.4 already installed
