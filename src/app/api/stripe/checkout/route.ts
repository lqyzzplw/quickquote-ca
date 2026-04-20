import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('email, stripe_customer_id, plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'pro') {
    return NextResponse.json({ error: 'Already on Pro plan' }, { status: 400 })
  }

  // Reuse existing Stripe customer or create new one
  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    // Save customer ID
    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/upgrade`,
    // metadata on the session itself (readable in checkout.session.completed)
    metadata: { supabase_user_id: user.id },
    // metadata on the subscription (readable in customer.subscription.* events)
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    allow_promotion_codes: true,
    // Address collection is required for Stripe Tax to calculate GST/HST/PST/QST
    billing_address_collection: 'required',
    // Enable Stripe Tax: auto-calculates Canadian sales tax based on the
    // customer's billing address (and our head office = Ontario)
    automatic_tax: { enabled: true },
    // Persist the captured address on the Customer so tax keeps working on renewals
    customer_update: { address: 'auto', name: 'auto' },
    // Let B2B customers enter a GST/HST number (optional, helps with reverse charge)
    tax_id_collection: { enabled: true },
  })

  return NextResponse.json({ url: session.url })
}
