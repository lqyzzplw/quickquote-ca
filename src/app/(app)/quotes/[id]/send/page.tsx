'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Quote } from '@/types'

type QuoteWithClient = Quote & {
  client?: { name: string; email: string | null; address: string | null }
  quote_line_items?: Quote['line_items']
}

export default function SendQuotePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [quote, setQuote] = useState<QuoteWithClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [upgrade, setUpgrade] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then(r => r.json())
      .then(({ data }) => { setQuote(data); setLoading(false) })
  }, [id])

  async function handleSend() {
    setSending(true)
    setError(null)
    const res = await fetch(`/api/quotes/${id}/send`, { method: 'POST' })
    const { data, error: apiError, upgrade: needsUpgrade } = await res.json()
    if (apiError) {
      setError(apiError)
      if (needsUpgrade) setUpgrade(true)
      setSending(false)
    } else if (data?.success) {
      setDone(true)
    }
  }

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
  if (!quote) return null

  if (done) {
    return (
      <div className="max-w-md mx-auto pt-12 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="text-xl font-semibold text-gray-900">Quote sent!</h1>
        <p className="text-sm text-gray-500">
          <strong>{quote.quote_number}</strong> was emailed to{' '}
          <strong>{quote.client?.email}</strong>
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href={`/quotes/${id}`}
            className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
            View Quote
          </Link>
          <Link href="/quotes/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            New Quote
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-lg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/quotes" className="hover:text-gray-600">Quotes</Link>
        <span>/</span>
        <Link href={`/quotes/${id}`} className="hover:text-gray-600">{quote.quote_number}</Link>
        <span>/</span>
        <span className="text-gray-600">Send</span>
      </div>

      <h1 className="text-xl font-semibold text-gray-900">Send Quote</h1>

      {/* Preview card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{quote.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{quote.quote_number}</p>
          </div>
          <p className="text-base font-bold text-gray-900">${Number(quote.total).toFixed(2)} CAD</p>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sending to</p>
          {quote.client?.email ? (
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
              <span className="text-lg">👤</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{quote.client.name}</p>
                <p className="text-xs text-gray-500">{quote.client.email}</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <p className="text-sm text-amber-700 font-medium">No client email on file</p>
              <p className="text-xs text-amber-600 mt-0.5">
                <Link href="/clients" className="underline">Add an email to the client</Link> before sending.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">What they&apos;ll receive</p>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li className="flex items-center gap-2"><span>📧</span> Email with quote summary</li>
            <li className="flex items-center gap-2"><span>📄</span> PDF attachment ({quote.quote_number}.pdf)</li>
          </ul>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{error}</p>
          {upgrade && (
            <Link href="/upgrade" className="mt-2 inline-block text-sm font-medium text-red-700 underline">
              Upgrade to Pro →
            </Link>
          )}
        </div>
      )}

      {/* Already sent */}
      {quote.status === 'sent' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            This quote was already sent on {quote.sent_at ? new Date(quote.sent_at).toLocaleDateString('en-CA') : '—'}.
            Sending again will deliver another copy.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 py-2.5 border border-gray-300 text-sm text-gray-600 rounded-xl hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !quote.client?.email}
          className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Sending…
            </span>
          ) : '📧 Send Quote'}
        </button>
      </div>
    </div>
  )
}
