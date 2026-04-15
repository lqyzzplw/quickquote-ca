import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Welcome to Pro — QuickQuote CA' }

export default async function UpgradeSuccessPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('users').select('business_name, plan').eq('id', user.id).single()
    : { data: null }

  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6">
      {/* Animated checkmark */}
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {profile?.business_name ? `Welcome to Pro, ${profile.business_name}!` : 'Welcome to Pro!'}
        </h1>
        <p className="text-gray-500">
          Your subscription is active. You now have unlimited quotes and all Pro features.
        </p>
      </div>

      {/* What's unlocked */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-left space-y-3">
        <p className="text-sm font-semibold text-green-800">What&apos;s unlocked:</p>
        {[
          '⚡ Unlimited quotes per month',
          '📄 AI-powered job description parsing',
          '📧 PDF generation & email delivery',
          '🇨🇦 All 13 Canadian provinces & territories',
        ].map((item) => (
          <p key={item} className="text-sm text-green-700">{item}</p>
        ))}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Link
          href="/quotes/new"
          className="bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Create Your First Pro Quote →
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>

      <p className="text-xs text-gray-400">
        A receipt has been sent to your email. Manage your subscription any time in{' '}
        <Link href="/settings" className="underline hover:text-gray-600">Settings</Link>.
      </p>
    </div>
  )
}
