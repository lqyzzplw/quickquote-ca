# QuickQuote CA — Code Audit (2026-06-26)

**Scope:** whole codebase (~4,200 LOC, Next.js 14 App Router + Supabase + Stripe + Anthropic + Resend).
**Method:** 8-dimension multi-agent audit (gstack/ultracode workflow) with per-finding adversarial verification, **plus** manual re-review + live verification of the 3 dimensions that died on rate-limits.
**Verification:** findings tagged 🔴 were confirmed against **live production HTTP** and/or the **live Supabase DB** (`zncgpsrhocybilzsbmds`), not just source code.

> ⚠️ **Audit-integrity caveat:** 3 of 8 finder agents (`tax-money`, `rls-db`, `auth-authz`) and the completeness-critic failed mid-run (server rate-limit + session limit, resets 9pm America/Toronto). Those 3 — the money + security core — were re-done **manually**. The 5 that completed (stripe, llm-parse, quote-lifecycle, nextjs-framework, quality-launch) produced 37 verified findings, but **several of their "critical/high" items were false positives**, refuted below by production probing.

---

## TL;DR — verdict

The product is **not yet safe to take real money** until **C1** is fixed. Everything else is fixable post-launch, but C1 is a trivial revenue bypass any logged-in user can run from the browser console.

| # | Severity | Finding | Status |
|---|---|---|---|
| **C1** | 🔴 **CRITICAL** | Any logged-in user can self-upgrade to **Pro for free** (and reset their quota) via direct PostgREST update | **Verified on live DB** |
| H1 | 🟠 HIGH | Quotes email from `onboarding@resend.dev` (Resend sandbox) → **won't deliver to real clients** | Verified (code + Resend behavior) |
| H2 | 🟠 HIGH | Free `quotes_sent_this_month` counter **never resets monthly** → "3/month" is actually "3 lifetime" | Verified (no reset anywhere) |
| M1 | 🟡 MED | **Nova Scotia HST = 15% in code; should be 14%** since 2025-04-01 | Verified vs CRA |
| M2 | 🟡 MED | No province set → quote silently gets **$0 tax** (under-charges) | Verified (route.ts:60) |
| M3 | 🟡 MED | `PATCH /api/quotes/[id]` mass-assigns whole body → self-corrupt totals/quote_number | Verified (RLS blocks cross-tenant) |
| M4 | 🟡 MED | `/api/ai/parse` has **no rate limit** → authed users can drain Anthropic budget | Verified (reachable, unlimited) |
| M5 | 🟡 MED | AI parse output **not numerically validated** → negative/NaN price/qty into totals | Verified |
| L1–L8 | ⚪ LOW | search_path, global quote-seq, rounding edge, middleware illusion, webhook idempotency, type/doc drift, pagination, status-write error-swallow | see below |

---

## 🔴 C1 — Privilege escalation: free → Pro via direct DB write  *(THE blocker)*

**Where:** `supabase/migrations/20260415034259_initial_schema.sql:26-28` + live grants.

**Verified on `zncgpsrhocybilzsbmds`:**
- `public.users` RLS policy `"Users can update own profile"`: `cmd=UPDATE`, `qual=(auth.uid() = id)`, **`with_check = NULL`**.
- Role `authenticated` holds `UPDATE` on `public.users` (default Supabase grant; never revoked).

**Why it's exploitable:** with no `WITH CHECK`, Postgres applies the `USING` qual as the check — the only thing a user *can't* change is their own `id`. Every other column (`plan`, `quotes_sent_this_month`, `stripe_customer_id`, …) is freely writable by the row's owner. The app already talks to this table from the **browser** (`src/app/(app)/quotes/new/page.tsx:36` reads `users`), so the `authenticated` client reaches it.

**Exploit (any logged-in free user, browser console):**
```js
// using the app's own supabase browser client + the user's session
await supabase.from('users')
  .update({ plan: 'pro', quotes_sent_this_month: 0 })
  .eq('id', '<their own user id>')
// → now Pro, quota reset, $0 paid. Stripe never involved.
```

**Impact:** direct, silent revenue loss the moment you have any real user who opens devtools. Also nullifies H2 (the quota cap) for anyone who knows the trick.

**Fix (column-level grant — no app code change; plan/quota already mutated only by service-role in the webhook + send route):**
```sql
-- Least privilege: authenticated may edit profile fields ONLY.
revoke update on public.users from authenticated;
grant update (name, business_name, logo_url, province) on public.users to authenticated;
revoke all on public.users from anon;   -- anon never needs this table
```
Ship as a properly-timestamped idempotent migration (your supabase-migrations rules). **Verify after:** re-run the exploit as a free user → the `plan` write should be rejected.

> Note: `quotes`, `clients`, `quote_line_items` are also fully granted to `authenticated`, but their data is the user's own and RLS `WITH CHECK` (via the `FOR ALL` USING fallback) blocks cross-tenant reassignment — so no escalation there. The `users` table is uniquely dangerous because it stores **entitlement** (`plan`) and **quota**.

---

## 🟠 HIGH

### H1 — Quote emails send from `onboarding@resend.dev` (will not reach clients)
`src/app/api/quotes/[id]/send/route.ts:69` → `from: 'QuickQuote CA <onboarding@resend.dev>'`. That's Resend's shared sandbox sender; in test mode it only delivers to the account owner's own verified address. **The core "send quote to client" action will silently fail to real recipients** (or 403 from Resend). Fix: verify a sending domain in Resend, send from `quotes@<yourdomain>`. Free in Resend (domain verification costs nothing). This is a launch blocker for the product's main verb.

### H2 — Free quota never resets (3 *lifetime*, not 3/month)
`send/route.ts:43` gates on `quotes_sent_this_month >= 3`, `:110-113` increments it, but **nothing ever resets it** (confirmed: no cron, no trigger, `billing_cycle_start` is written nowhere). A free user who sends 3 quotes is permanently capped → churns instead of converting. Fix: reset when `billing_cycle_start` rolls over (check on send, or a monthly cron), e.g. `if today >= billing_cycle_start + 1 month: counter=0; billing_cycle_start=today`.

---

## 🟡 MEDIUM

### M1 — Nova Scotia HST rate is stale (15% → 14%)
`src/lib/tax.ts:24` `NS: { rate: 0.15 }`. NS reduced the provincial portion 10%→9% on **2025-04-01**, making HST **14%** (CRA; multiple 2026 sources). Every other rate verified correct (ON 13, NB/NL/PEI 15, QC GST5+QST9.975, BC/MB PST7, SK PST6, AB/territories 5). For a product whose pitch *is* tax correctness, a wrong rate is reputationally expensive. Fix: `NS: 0.14`. (Also worth a recurring check — rates change.)

### M2 — No province → quote gets $0 tax silently
`src/app/api/quotes/route.ts:60` `if (profile?.province)` — if the user never set a province, `tax_amount=0`, `tax_type=null`, quote total = subtotal. The UI warns (`new/page.tsx:250`) but doesn't block, and onboarding doesn't force province. Result: a contractor can send a legally-wrong $0-tax quote. Fix: require province at onboarding, and/or reject quote creation without it.

### M3 — Mass assignment in `PATCH /api/quotes/[id]`
`[id]/route.ts:36` `.update({ ...body })` spreads the entire request body. Status is validated but nothing else is. RLS blocks reassigning `user_id` to another user (good — verified), so this is **self-scoped**: a user can overwrite their own quote's `total`, `subtotal`, `tax_amount`, `quote_number`, `sent_at`, etc., bypassing the server tax calc. Fix: whitelist updatable fields (`const { status } = body; .update({ status })`).

### M4 — `/api/ai/parse` has no rate limit (cost-abuse)
`src/app/api/ai/parse/route.ts` is auth-gated but unlimited and **not plan-gated** (verified: no ratelimit/quota anywhere in `src/`). Any logged-in user can loop it and run up your Anthropic bill — real money, pre-revenue. Fix: per-user rate limit (Upstash free tier) or count it against the free quota.

### M5 — AI parse output not numerically validated
`parse/route.ts:51-58` returns the model's `line_items` to the client, which feed `POST /api/quotes` where `subtotal = Σ qty*unit_price` with **no check that qty/unit_price are finite, non-negative numbers**. A bad model output (or hand-crafted POST) → negative/NaN totals persisted. (The adversarial verifier correctly *refuted* the stronger "prompt-injection sets final prices" claim — the user reviews/edits line items before save — but the missing numeric validation is real.) Fix: validate/coerce `quantity>0`, `unit_price>=0`, finite, in the API.

---

## ⚪ LOW

- **L1** `next_quote_number()` is `SECURITY DEFINER` **without** `set search_path` (`20260415040310_*.sql`). Mitigated because internal refs are schema-qualified (`public.quote_number_seq`), but Supabase's advisor flags it. Add `set search_path = public`.
- **L2** Single global `quote_number_seq` → quote numbers are global, so each user sees gaps (QQ-0001, QQ-0007…). Minor volume leak + looks unpolished. Consider per-user numbering.
- **L3** Rounding boundary: API rounds the *summed* subtotal, but DB `line_total` is per-row `numeric(10,2)`. With sub-cent unit prices the displayed line items can sum to a different value than the displayed subtotal. Negligible for trades pricing; note it.
- **L4** **Middleware protects less than its code implies.** `middleware.ts` reads as "redirect everything not in `publicRoutes`," but in production only **dynamic app pages** are redirected (`/dashboard`, `/settings` → 307); **all `/api/*` self-protect** and **static pages are public**. The API routes do correctly check auth themselves, so there's no hole today — but don't treat middleware as the security boundary; keep enforcing in each route + RLS. Make intent explicit (whitelist `/blog`,`/privacy`,`/terms`,`/sitemap.xml`,`/onboarding` or narrow the matcher) so a future Next.js change can't silently shift behavior.
- **L5** Stripe webhook has no event idempotency/dedup (`webhooks/stripe/route.ts`). Safe today (all branches are idempotent UPDATEs) but add a `processed_stripe_events(event_id pk)` guard before adding any non-idempotent side effect.
- **L6** `send/route.ts:104-107` updates quote status without checking the DB error → status may silently not persist after a successful send. Check the error.
- **L7** Type/doc drift: `billing_cycle_start` in `database.types.ts` missing from `types/index.ts User`; `PLAN.md` says all phases "Not Started" (contradicts shipped code).
- **L8** `GET /api/quotes` returns all quotes, no pagination. Fine at current scale.

---

## ✅ Refuted (don't action these)

**By the workflow's own adversarial layer:**
- *"Prompt injection sets final line-item prices"* — user reviews/edits parsed items before save; totals computed server-side from the saved items.
- *"Upgrade success page may show free plan"* — handled.

**By production probing (workflow false positives — reasoned from source, not tested):**
- 🔴→❌ *"Middleware redirects the Stripe webhook → payments never activate Pro."* `POST /api/webhooks/stripe` returns **400** (signature check ran) — reachable.
- 🟠→❌ *"Keepalive blocked by middleware → Supabase auto-pauses."* `/api/cron/keepalive` returns **401** (route's own auth) — reachable.
- 🟠→❌ *"Marketing/legal pages require login."* `/blog`, `/privacy`, `/terms`, `/sitemap.xml` all return **200**.
- 🟡→❌ *"Signup → /onboarding lands on an auth-gated page."* `/onboarding` returns **200**.

*(Verified-correct by the stripe agent: webhook signature uses the raw body + required secret; checkout binds the session to the authed user with server-side price — no tampering vector. Good.)*

---

## Completeness / launch-readiness gaps (critic dimension — done manually)

- **No automated tests** at all (`package.json` has no test script). For money + tax logic, add at least unit tests on `calculateTax` (all 13 provinces) and the quota gate.
- **No account/data deletion** path, yet the landing trust band advertises PIPEDA. Add a delete-my-data flow before leaning on that claim.
- **No Stripe customer portal** for self-serve cancellation/management.
- **No error monitoring** (Sentry/Logflare). Swallowed errors (M5, L6) + no monitoring = you won't see a failed first conversion.

---

## Recommended order

1. **C1** (DB migration) — before any real signup. *Blocker.*
2. **H1** (Resend domain) — before telling anyone to use it; the send feature is dead without it.
3. **M1, M2** (tax rate + province gate) — cheap, protects the core value prop.
4. **H2, M4** (quota reset + parse rate-limit) — before marketing drives signups.
5. **M3, M5, L1, L4–L7** — hardening pass.
6. Tests + monitoring + account deletion — launch-readiness.

---
*Audit cost: 33 agents, ~1.78M tokens (workflow) + manual verification. The rate-limit failures on the 3 critical dimensions are the reason C1 nearly slipped — the lesson: empirical DB/HTTP verification caught both the real critical AND the false criticals.*
