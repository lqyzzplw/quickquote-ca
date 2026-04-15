'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PROVINCES } from '@/lib/tax'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [businessName, setBusinessName] = useState('')
  const [province, setProvince] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!province) { setError('Please select your province'); return }
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { error } = await supabase
      .from('users')
      .update({ business_name: businessName || null, province })
      .eq('id', user.id)
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard') }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl">🇨🇦</span>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Set up your profile</h1>
          <p className="mt-1 text-sm text-gray-500">We need your province to apply the right taxes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {error && <div className="mb-4 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business name <span className="text-gray-400">(optional)</span></label>
              <input
                type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Smith Plumbing"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province <span className="text-red-500">*</span></label>
              <select
                value={province} onChange={e => setProvince(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select your province…</option>
                {PROVINCES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Get started →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
