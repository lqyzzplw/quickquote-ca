import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UpgradeCheckoutButton from './checkout-button'

export const metadata = { title: 'Upgrade to Pro — QuickQuote CA' }

const FEATURES = [
  'Unlimited quotes per month',
  'AI-powered job description parsing',
  'PDF generation & email delivery',
  'Canadian tax engine (all 13 provinces)',
  'Client management',
  'Priority support',
]

export default async function UpgradePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('plan, quotes_sent_this_month')
    .eq('id', user.id)
    .single()

  const isPro = profile?.plan === 'pro'

  if (isPro) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="text-5xl">⚡</div>
        <h1 className="text-2xl font-bold text-gray-900">You&apos;re already on Pro!</h1>
        <p className="text-gray-500">Enjoy unlimited quotes and all Pro features.</p>
        <a href="/dashboard" className="inline-block mt-4 bg-blue-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">
          Go to Dashboard
        </a>
      </div>
    )
  }

  const sentThisMonth = profile?.quotes_sent_this_month ?? 0

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      {/* Usage reminder */}
      {sentThisMonth >= 3 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm font-medium text-amber-800">
            You&apos;ve hit your 3-quote free limit this month.
          </p>
          <p className="text-xs text-amber-600 mt-1">Upgrade now to keep sending quotes.</p>
        </div>
      )}

      {/* Plan card */}
      <div className="bg-white border-2 border-blue-500 rounded-2xl p-6 shadow-sm">
        {/* Badge */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">QuickQuote Pro</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            Most Popular
          </span>
        </div>

        {/* Price */}
        <div className="mb-6">
          <span className="text-4xl font-extrabold text-gray-900">$15</span>
          <span className="text-gray-500 ml-1">CAD / month</span>
          <p className="text-xs text-gray-400 mt-1">Billed monthly. Cancel any time.</p>
        </div>

        {/* Feature list */}
        <ul className="space-y-3 mb-8">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="text-green-500 font-bold flex-shrink-0">✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <UpgradeCheckoutButton />
      </div>

      {/* Free plan comparison */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Your current Free plan includes:</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-3 text-sm text-gray-500">
            <span className="text-gray-300">✓</span> 3 quotes per month
          </li>
          <li className="flex items-center gap-3 text-sm text-gray-500">
            <span className="text-gray-300">✓</span> AI parsing, PDF & email
          </li>
          <li className="flex items-center gap-3 text-sm text-gray-500">
            <span className="text-gray-300">✓</span> Canadian tax engine
          </li>
        </ul>
      </div>

      <p className="text-xs text-center text-gray-400">
        Secure payment via Stripe. Your card details are never stored on our servers.
      </p>
    </div>
  )
}
