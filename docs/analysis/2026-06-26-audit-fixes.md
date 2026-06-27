# QuickQuote CA — Audit Fixes (draft)

Companion to `docs/analysis/2026-06-26-code-audit.md`. Review-ready diffs. Nothing here is applied yet.

**Status of each:**
- ✅ **C1** — drafted as migration `supabase/migrations/20260627035308_lock_down_users_privileged_columns.sql`
- ✅ **L1** — drafted as migration `supabase/migrations/20260627040159_pin_function_search_path.sql`
- ⬇️ **H1, H2, M1, M2, M3, M5, L6** — code diffs below
- 🟡 **M4** — needs one small decision (see bottom)

---

## M1 — Nova Scotia HST 15% → 14%
**`src/lib/tax.ts`** (line 24)
```diff
-  NS:  { type: 'HST',     lines: [{ name: 'HST', rate: 0.15 }] },
+  NS:  { type: 'HST',     lines: [{ name: 'HST', rate: 0.14 }] },  // 14% since 2025-04-01
```

---

## M3 — Mass-assignment in PATCH (whitelist `status` only)
**`src/app/api/quotes/[id]/route.ts`** (PATCH body, lines ~27–36)
```diff
   const body = await request.json()
   const { status } = body

   const allowed = ['draft', 'sent', 'accepted', 'declined']
-  if (status && !allowed.includes(status)) {
+  if (!status || !allowed.includes(status)) {
     return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
   }

   const { data, error } = await supabase
     .from('quotes')
-    .update({ ...body })
+    .update({ status })   // whitelist — never spread the raw request body
     .eq('id', params.id)
     .eq('user_id', user.id)
```
*Note:* the only caller (quote detail page) PATCHes `status`. Confirm no other caller sends additional fields before applying.

---

## M5 + M2 — Validate line-item numbers + require province
**`src/app/api/quotes/route.ts`** (POST)

**M5** — after the existing `line_items?.length` check (~line 35), add:
```ts
  // Validate every line item is a sane number (M5)
  for (const item of line_items) {
    const q = Number(item.quantity)
    const p = Number(item.unit_price)
    if (!item.description?.trim() || !Number.isFinite(q) || q <= 0 || !Number.isFinite(p) || p < 0) {
      return NextResponse.json(
        { error: 'Each line item needs a description, a positive quantity, and a non-negative price.' },
        { status: 400 }
      )
    }
  }
```

**M2** — after the profile fetch (~line 42), require a province, then simplify the tax block:
```diff
   const { data: profile } = await supabase
     .from('users')
     .select('province, plan, quotes_sent_this_month')
     .eq('id', user.id)
     .single()

+  // Require province so tax is always applied correctly (M2)
+  if (!profile?.province) {
+    return NextResponse.json(
+      { error: 'Set your province in Settings before creating quotes — it determines the tax applied.' },
+      { status: 400 }
+    )
+  }
+
   // Generate quote number via RPC
   ...
   const subtotal = line_items.reduce(...)

-  let taxAmount = 0
-  let taxType = null
-  let taxRate = null
-
-  if (profile?.province) {
-    const tax = calculateTax(subtotal, profile.province as Province)
-    taxAmount = tax.taxAmount
-    taxType = tax.taxType
-    taxRate = tax.lines.reduce((sum, l) => sum + l.rate, 0)
-  }
+  const tax = calculateTax(subtotal, profile.province as Province)
+  const taxAmount = tax.taxAmount
+  const taxType = tax.taxType
+  const taxRate = tax.lines.reduce((sum, l) => sum + l.rate, 0)

   const total = subtotal + taxAmount
```
*Behavior change:* quote creation now hard-requires a province. Onboarding already forces it (`onboarding/page.tsx:18`), so only accounts that skipped onboarding are affected — they'll be told to set it. Confirm you want this hard block (vs. a soft $0-tax quote).

---

## H1 — Quote email sender via env (don't hardcode the Resend sandbox)
**`src/app/api/quotes/[id]/send/route.ts`** (line 69)
```diff
-    from: 'QuickQuote CA <onboarding@resend.dev>',
+    from: process.env.RESEND_FROM ?? 'QuickQuote CA <onboarding@resend.dev>',
```
**`.env.example`** — add:
```
# Verified Resend sender. Until you verify a domain in Resend, onboarding@resend.dev
# ONLY delivers to your own account email — real client emails will fail.
RESEND_FROM="QuickQuote CA <quotes@yourdomain.ca>"
```
> ⚠️ This is half code, half ops: the code change is trivial, but **emails won't reach real clients until you verify a sending domain in Resend** (free) and set `RESEND_FROM` in Vercel prod env.

---

## H2 — Free quota resets monthly (currently never resets)
**`src/app/api/quotes/[id]/send/route.ts`**

Select `billing_cycle_start` and compute a rolling monthly window:
```diff
   const { data: profile } = await supabase
     .from('users')
-    .select('name, business_name, province, plan, quotes_sent_this_month')
+    .select('name, business_name, province, plan, quotes_sent_this_month, billing_cycle_start')
     .eq('id', user.id)
     .single()

-  // Freemium gate — enforce server-side
-  if (profile?.plan === 'free' && (profile?.quotes_sent_this_month ?? 0) >= 3) {
+  // Monthly freemium gate — reset the counter when the cycle has rolled over (H2)
+  const today = new Date()
+  const cycleStart = profile?.billing_cycle_start ? new Date(profile.billing_cycle_start) : null
+  const cycleExpired =
+    !cycleStart ||
+    today >= new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, cycleStart.getDate())
+  const usedThisCycle = cycleExpired ? 0 : (profile?.quotes_sent_this_month ?? 0)
+
+  if (profile?.plan === 'free' && usedThisCycle >= 3) {
     return NextResponse.json({
       error: 'Free plan limit reached (3 quotes/month). Upgrade to Pro to send more.',
       upgrade: true,
     }, { status: 403 })
   }
```
And the increment (lines ~109–113):
```diff
-  // Increment monthly counter
-  await adminClient
-    .from('users')
-    .update({ quotes_sent_this_month: (profile?.quotes_sent_this_month ?? 0) + 1 })
-    .eq('id', user.id)
+  // Increment the cycle counter, resetting the window if the cycle had expired (H2)
+  await adminClient
+    .from('users')
+    .update({
+      quotes_sent_this_month: usedThisCycle + 1,
+      billing_cycle_start: cycleExpired
+        ? today.toISOString().split('T')[0]
+        : (profile?.billing_cycle_start ?? today.toISOString().split('T')[0]),
+    })
+    .eq('id', user.id)
```

---

## L6 — Don't swallow the post-send status write
**`src/app/api/quotes/[id]/send/route.ts`** (lines ~104–107)
```diff
-  await supabase
-    .from('quotes')
-    .update({ status: 'sent', sent_at: new Date().toISOString() })
-    .eq('id', params.id)
+  const { error: statusErr } = await supabase
+    .from('quotes')
+    .update({ status: 'sent', sent_at: new Date().toISOString() })
+    .eq('id', params.id)
+    .eq('user_id', user.id)
+  if (statusErr) console.error('Quote status update failed after send:', statusErr)
```

---

## 🟡 M4 — Rate-limit `/api/ai/parse` (needs one decision)
The parse endpoint calls Anthropic on every request with no cap → an authed user can run up your API bill. A correct serverless limiter needs shared state. Two free options:

- **A. DB-backed daily cap (no new service):** add `ai_parses_today int`, `ai_parses_date date` to `users`; on each parse, reset if the date rolled over, reject past a cap (e.g. 30/day free, higher for Pro). Reuses Supabase; one small migration + ~8 lines in the route.
- **B. Upstash Redis rate-limit (`@upstash/ratelimit`):** cleaner sliding-window, free tier, but adds an external dependency + 2 env vars.

I'd default to **A** (no new platform, consistent with "free tier / no new accounts"). Say which and I'll draft it.

---

## How to apply (your call — I won't push/merge)
1. I branch off `main` (`fix/audit-2026-06-26`), apply M1/M2/M3/M5/H1/H2/L6 via Bash, and run `npm run build` to confirm it compiles.
2. The two migrations stay as files; applying them to the DB (`zncgpsrhocybilzsbmds`) is a separate, explicitly-authorized step (and after an MCP apply, rename to the remote-recorded timestamp per your migration rules).
3. You review the diff → if good, I commit + push the branch + open a PR for **you** to merge.
