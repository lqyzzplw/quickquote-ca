'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UpgradeCheckoutButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleUpgrade() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      if (data.url) {
        router.push(data.url)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed text-base"
      >
        {loading ? 'Redirecting to checkout…' : 'Upgrade to Pro — $15 CAD/mo'}
      </button>
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
