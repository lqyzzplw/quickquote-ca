'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PROVINCES } from '@/lib/tax'
import type { User } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [province, setProvince] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as unknown as User)
        setName(data.name ?? '')
        setBusinessName(data.business_name ?? '')
        setProvince(data.province ?? '')
      }
    }
    loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('users').update({
      name: name || null,
      business_name: businessName || null,
      province: province || null,
    }).eq('id', user.id)
    setLoading(false)
    if (error) setError(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-semibold text-gray-900">Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Business Profile</h2>
        {error && <div className="mb-3 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Your name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Business name</label>
            <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Smith Plumbing"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Province <span className="text-gray-400">(used for tax calculation)</span></label>
            <select value={province} onChange={e => setProvince(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Select province…</option>
              {PROVINCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {saved ? '✓ Saved!' : loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Plan</h2>
        <p className="text-sm text-gray-500 mb-3">
          {profile?.plan === 'pro' ? '⚡ Pro plan — unlimited quotes' : '🆓 Free plan — 3 quotes/month'}
        </p>
        {profile?.plan !== 'pro' && (
          <a href="/upgrade" className="inline-block bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-600 transition">
            Upgrade to Pro — $15 CAD/mo
          </a>
        )}
      </div>

      <button onClick={handleSignOut} className="text-sm text-red-500 hover:text-red-700">
        Sign out
      </button>
    </div>
  )
}
