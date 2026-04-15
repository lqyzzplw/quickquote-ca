import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { adminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // STRIPE_WEBHOOK_SECRET must be set — add whsec_... from Stripe dashboard
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // supabase_user_id is stored in session.metadata at checkout creation
        const userId = session.metadata?.supabase_user_id

        if (userId && session.subscription) {
          await adminClient
            .from('users')
            .update({
              plan: 'pro',
              stripe_subscription_id: session.subscription as string,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id

        if (userId) {
          const isActive = ['active', 'trialing'].includes(sub.status)
          await adminClient
            .from('users')
            .update({
              plan: isActive ? 'pro' : 'free',
              stripe_subscription_id: sub.id,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id

        if (userId) {
          await adminClient
            .from('users')
            .update({ plan: 'free', stripe_subscription_id: null })
            .eq('id', userId)
        }
        break
      }

      default:
        // Unhandled event — ignore
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
