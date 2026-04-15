'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Quote } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-600',
  sent:     'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  type QuoteWithRelations = Quote & { client?: { name: string; email: string | null } }
  const [quote, setQuote] = useState<QuoteWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadQuote() }, [id])

  async function loadQuote() {
    setLoading(true)
    const res = await fetch(`/api/quotes/${id}`)
    const { data, error } = await res.json()
    if (error) setError(error)
    else setQuote(data)
    setLoading(false)
  }

  async function updateStatus(status: string) {
    setUpdating(true)
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const { data, error } = await res.json()
    if (error) setError(error)
    else setQuote(data)
    setUpdating(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this quote? This cannot be undone.')) return
    await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
    router.push('/quotes')
  }

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
  if (error) return <div className="text-sm text-red-500 py-8 text-center">{error}</div>
  if (!quote) return null

  const taxLines = quote.tax_type && quote.subtotal
    ? getTaxLines(quote.subtotal, quote.tax_type, quote.tax_amount)
    : []

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/quotes" className="text-sm text-gray-400 hover:text-gray-600">Quotes</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">{quote.quote_number}</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{quote.title}</h1>
          {quote.client && (
            <p className="text-sm text-gray-500 mt-0.5">{quote.client.name}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[quote.status] ?? ''}`}>
          {quote.status}
        </span>
      </div>

      {/* Meta */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-400">Quote number</p>
          <p className="font-medium text-gray-800">{quote.quote_number}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Date</p>
          <p className="font-medium text-gray-800">{new Date(quote.created_at).toLocaleDateString('en-CA')}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Expires</p>
          <p className="font-medium text-gray-800">{quote.expires_at ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Client</p>
          <p className="font-medium text-gray-800">{quote.client?.name ?? '—'}</p>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Line Items</h2>
        </div>
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100">
          <span className="col-span-6">Description</span>
          <span className="col-span-2 text-right">Qty</span>
          <span className="col-span-2 text-right">Unit Price</span>
          <span className="col-span-2 text-right">Total</span>
        </div>
        <div className="divide-y divide-gray-100">
          {quote.line_items?.map(item => (
            <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 text-sm">
              <span className="col-span-6 text-gray-800">{item.description}</span>
              <span className="col-span-2 text-right text-gray-600">{item.quantity}</span>
              <span className="col-span-2 text-right text-gray-600">${Number(item.unit_price).toFixed(2)}</span>
              <span className="col-span-2 text-right font-medium text-gray-800">${Number(item.line_total).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${Number(quote.subtotal).toFixed(2)}</span>
          </div>
          {taxLines.map(line => (
            <div key={line.name} className="flex justify-between text-sm text-gray-600">
              <span>{line.name} ({(line.rate * 100).toFixed(line.rate === 0.09975 ? 3 : 0)}%)</span>
              <span>${line.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-base font-semibold text-gray-900 pt-1 border-t border-gray-200">
            <span>Total</span>
            <span>${Number(quote.total).toFixed(2)} CAD</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Actions</h2>

        {/* Send button — will be wired up in Phase 3 */}
        <Link
          href={`/quotes/${id}/send`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          📧 Send to Client
        </Link>

        {/* Status updates */}
        {quote.status === 'sent' && (
          <div className="flex gap-2">
            <button
              onClick={() => updateStatus('accepted')}
              disabled={updating}
              className="flex-1 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200 hover:bg-green-100 transition disabled:opacity-50"
            >
              ✓ Mark Accepted
            </button>
            <button
              onClick={() => updateStatus('declined')}
              disabled={updating}
              className="flex-1 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 transition disabled:opacity-50"
            >
              ✗ Mark Declined
            </button>
          </div>
        )}

        {quote.status === 'draft' && (
          <button
            onClick={() => updateStatus('sent')}
            disabled={updating}
            className="w-full py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            Mark as Sent (manual)
          </button>
        )}

        <button
          onClick={handleDelete}
          className="w-full py-2 text-sm text-red-500 hover:text-red-700 transition"
        >
          Delete quote
        </button>
      </div>
    </div>
  )
}

// Helper to reconstruct tax lines for display
function getTaxLines(subtotal: number, taxType: string, totalTax: number) {
  const configs: Record<string, { name: string; rate: number }[]> = {
    'HST':     [{ name: 'HST', rate: totalTax / subtotal }],
    'GST':     [{ name: 'GST', rate: 0.05 }],
    'GST+PST': [{ name: 'GST', rate: 0.05 }, { name: 'PST', rate: totalTax / subtotal - 0.05 }],
    'GST+QST': [{ name: 'GST', rate: 0.05 }, { name: 'QST', rate: 0.09975 }],
  }
  const lines = configs[taxType] ?? []
  return lines.map(l => ({ name: l.name, rate: l.rate, amount: Math.round(subtotal * l.rate * 100) / 100 }))
}
