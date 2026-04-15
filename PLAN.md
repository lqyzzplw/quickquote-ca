# QuickQuote CA — Build Plan

> AI-powered quote generator for Canadian tradespeople.
> Profitable at 2 paying users ($15 CAD/mo Pro plan).

---

## Phase Overview

| Phase | Goal | Target | Status |
|-------|------|--------|--------|
| 0 | Repo scaffold + memory + env | 2026-04-14 | ✅ Done |
| 1 | Auth + User Profile + Clients | 2026-04-21 | ⬜ Not Started |
| 2 | AI Parse + Quote Engine + Tax | 2026-04-28 | ⬜ Not Started |
| 3 | PDF Generation + Email + Dashboard | 2026-05-05 | ⬜ Not Started |
| 4 | Stripe Paywall + Landing Page + Beta | 2026-05-12 | ⬜ Not Started |
| 5 | Launch — SEO + Marketing + MRR tracking | 2026-06-01 | ⬜ Not Started |

---

## Phase 0 — Repo Scaffold ✅

**Goal:** Non-negotiable day-one setup complete.
**Done when:** Next.js runs locally, memory files exist, .env.example covers all keys, PLAN.md committed.

### Tasks
- [x] Scaffold Next.js 14 (App Router, TypeScript, Tailwind)
- [x] Create PLAN.md
- [x] Create .env.example
- [x] Create .claude/memory/ files
- [x] Create supabase/migrations/ directory
- [x] Create scripts/ directory
- [ ] Install core dependencies (supabase, stripe, resend, anthropic, react-pdf)
- [ ] Commit scaffold to GitHub

---

## Phase 1 — Auth + User Profile + Clients

**Goal:** Users can sign up, log in, set their province, and manage clients.
**Done when:** Auth works end-to-end (email + Google), profile page saves province, client CRUD works.

### Tasks
- [ ] Create Supabase project + apply initial migration
- [ ] Configure Supabase Auth (email + Google OAuth)
- [ ] Build login/signup pages (`/auth/login`, `/auth/signup`)
- [ ] Build user profile page (`/settings`) — business name, logo, province
- [ ] Province-onboarding prompt for first-time users
- [ ] Client list page (`/clients`)
- [ ] Client create/edit modal
- [ ] Middleware: protect all routes except `/auth/*` and `/`

### Key files
- `src/app/auth/login/page.tsx`
- `src/app/auth/signup/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/clients/page.tsx`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `supabase/migrations/001_initial_schema.sql`
- `middleware.ts`

---

## Phase 2 — AI Parse + Quote Engine + Tax

**Goal:** Tradespeople can describe a job in plain English and get a structured quote with correct Canadian taxes.
**Done when:** AI parse works, line items editable, taxes auto-applied by province.

### Tasks
- [ ] Build `/api/ai/parse` route (Claude Haiku)
- [ ] New quote page (`/quotes/new`) — client selector + free-text input
- [ ] Quote line item editor (editable table)
- [ ] Canadian tax engine (`src/lib/tax.ts`)
- [ ] Quote save as draft
- [ ] Quote numbering logic (QQ-0001, QQ-0002...)

### Key files
- `src/app/api/ai/parse/route.ts`
- `src/app/quotes/new/page.tsx`
- `src/components/quote/LineItemEditor.tsx`
- `src/lib/tax.ts`
- `supabase/migrations/002_quotes.sql`

---

## Phase 3 — PDF + Email + Dashboard

**Goal:** Quotes can be sent as branded PDFs directly to clients. Dashboard tracks status.
**Done when:** PDF generates correctly, email sends, dashboard shows Sent/Accepted/Declined.

### Tasks
- [ ] PDF template with @react-pdf/renderer
- [ ] `/api/quotes/[id]/send` route — generate PDF + email via Resend
- [ ] Quote dashboard (`/quotes`) — list with status badges
- [ ] Manual status update (Accepted / Declined)
- [ ] PDF preview before sending

### Key files
- `src/app/api/quotes/[id]/send/route.ts`
- `src/components/quote/PDFTemplate.tsx`
- `src/app/quotes/page.tsx`
- `src/app/quotes/[id]/page.tsx`

---

## Phase 4 — Stripe + Landing Page + Beta

**Goal:** Monetisation live. Real tradespeople testing it.
**Done when:** Pro subscription works, freemium gate active, landing page live, 3+ beta users.

### Tasks
- [ ] Stripe product + price ($15 CAD/mo)
- [ ] `/api/webhooks/stripe` handler
- [ ] Stripe Checkout session route
- [ ] Freemium gate (block send after 3 quotes/month on free)
- [ ] Upgrade prompt UI
- [ ] Landing page (`/`) — hero, features, pricing, CTA
- [ ] Set up custom domain
- [ ] Recruit 3–5 beta tradespeople
- [ ] create-test-users.js script

### Key files
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/stripe/checkout/route.ts`
- `src/app/page.tsx` (landing page)
- `scripts/create-test-users.js`

---

## Phase 5 — Launch

**Goal:** Public launch. Hit breakeven (2 Pro users).
**Done when:** MRR ≥ $30 CAD.

### Tasks
- [ ] SEO — meta tags, OG images, sitemap
- [ ] Post to r/canadiancontractors, Facebook trade groups
- [ ] Product Hunt launch
- [ ] Monitor Stripe MRR dashboard
