# Project State

## Current Phase
**Phase 4 — Stripe + Landing Page + Beta** ✅ Complete (2026-04-14)
**Next: Phase 5 — Launch (custom domain, Vercel deploy, beta users, SEO)**

## Overall Progress
| Phase | Status | % |
|-------|--------|---|
| 0 — Scaffold | ✅ Done | 100% |
| 1 — Auth + Profile + Clients | ✅ Done | 100% |
| 2 — AI + Quote Engine + Tax | ✅ Done | 100% |
| 3 — PDF + Email + Send | ✅ Done | 100% |
| 4 — Stripe + Landing + Beta | ✅ Done | 100% |
| 5 — Launch | ⬜ Not Started | 0% |

## Last Session (2026-04-14)
- Phase 4 shipped: Stripe checkout API, webhook handler, /upgrade page, /upgrade/success page, landing page (/)
- STRIPE_WEBHOOK_SECRET saved to .env.local (whsec_B3wU7SaU0ULjdB1IuYPGbd9YC8c1Szml)
- Stripe API version updated to 2026-03-25.dahlia (SDK latest)
- webhook: checkout.session.completed uses session.metadata.supabase_user_id
- Build passes clean — 20 routes

## What's Next (Phase 5)
1. Deploy to Vercel (connect GitHub repo)
2. Set up custom domain (quickquoteca.com → Vercel)
3. Update STRIPE_WEBHOOK_SECRET in Vercel env vars (production whsec_...)
4. Update Stripe webhook endpoint URL to https://quickquoteca.com/api/webhooks/stripe
5. Add NEXT_PUBLIC_APP_URL=https://quickquoteca.com in Vercel
6. Set up Resend custom domain (quotes@quickquoteca.com)
7. Recruit beta users

## All Credentials (in .env.local — never committed)
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ ANTHROPIC_API_KEY
- ✅ KIMI_API_KEY (backup)
- ✅ RESEND_API_KEY
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- ✅ STRIPE_SECRET_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ STRIPE_PRO_PRICE_ID

## Notes
- Google OAuth not yet configured (user chose email-only for now)
- Resend custom domain (quickquoteca.com) not yet set up — using onboarding@resend.dev sender
- react-pdf uses require() import due to type incompatibility with renderToBuffer
- Stripe webhook: local testing needs `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
