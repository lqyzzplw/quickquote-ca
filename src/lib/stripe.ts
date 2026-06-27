import Stripe from 'stripe'

// Lazily instantiated so `next build` page-data collection doesn't require
// STRIPE_SECRET_KEY at build time (absent in Preview env).
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    })
  }
  return _stripe
}
