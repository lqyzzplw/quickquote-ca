'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

export default function NewQuotePage() {
  const router = useRouter()
  const supabase = createClient()

  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [description, setDescription] = useState('')
  const [title, setTitle] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', quantity: 1, unit_price: 0 }])
  const [province, setProvince] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parseWarning, setParseWarning] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'describe' | 'review'>('describe')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: clientsData }, { data: profile }] = await Promise.all([
        supabase.from('clients').select('*').order('name'),
        supabase.from('users').select('province').eq('id', user.id).single(),
      ])
      setClients(clientsData ?? [])
      setProvince(profile?.province ?? null)
    }
    load()
  }, [])

  async function handleParse() {
    if (!description.trim()) return
    setParsing(true)
    setParseWarning(null)
    setError(null)
    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, province }),
      })
      const { data, warning } = await res.json()
      if (data) {
        if (data.title) setTitle(data.title)
        if (data.line_items?.length) setLineItems(data.line_items)
        if (warning) setParseWarning(warning)
        setStep('review')
      }
    } catch {
      setParseWarning('Could not parse — please fill in manually')
      setStep('review')
    } finally {
      setParsing(false)
    }
  }

  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    setLineItems(prev => prev.map((item, idx) =>
      idx === i ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
    ))
  }

  function addItem() {
    setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0 }])
  }

  function removeItem(i: number) {
    setLineItems(prev => prev.filter((_, idx) => idx !== i))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  async function handleSave() {
    if (!title.trim()) { setError('Please enter a quote title'); return }
    if (!lineItems.some(i => i.description.trim())) { setError('Add at least one line item'); return }
    setSaving(true)
    setError(null)
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description_raw: description,
        client_id: clientId || null,
        line_items: lineItems.filter(i => i.description.trim()),
      }),
    })
    const { data, error: apiError } = await res.json()
    if (apiError) { setError(apiError); setSaving(false) }
    else router.push(`/quotes/${data.id}`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">New Quote</h1>
        {step === 'review' && (
          <button onClick={() => setStep('describe')} className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </button>
        )}
      </div>

      {/* Client selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Client <span className="text-gray-400">(optional)</span></label>
        <select
          value={clientId} onChange={e => setClientId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No client selected</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {!clients.length && (
          <p className="text-xs text-gray-400 mt-1">
            <a href="/clients" className="text-blue-500 hover:underline">Add clients</a> to attach them to quotes.
          </p>
        )}
      </div>

      {step === 'describe' ? (
        /* Step 1: Describe the job */
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Describe the job</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Replace hot water tank, 3 hours labour at $85/hr, new 40 gallon tank for $450"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">AI will parse this into a structured quote automatically.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleParse}
              disabled={!description.trim() || parsing}
              className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-40"
            >
              {parsing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Parsing…
                </span>
              ) : '✨ Generate Quote'}
            </button>
            <button
              onClick={() => setStep('review')}
              className="px-4 py-2.5 border border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition"
            >
              Fill manually
            </button>
          </div>
        </div>
      ) : (
        /* Step 2: Review & edit */
        <div className="space-y-4">
          {parseWarning && (
            <div className="bg-amber-50 text-amber-700 text-sm px-4 py-2.5 rounded-lg">{parseWarning}</div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg">{error}</div>
          )}

          {/* Title */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Quote title</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Hot Water Tank Replacement"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Line items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Line Items</h2>
            </div>

            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-right">Qty</span>
              <span className="col-span-3 text-right">Unit Price</span>
              <span className="col-span-1" />
            </div>

            <div className="divide-y divide-gray-100">
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center">
                  <input
                    type="text" value={item.description}
                    onChange={e => updateItem(i, 'description', e.target.value)}
                    placeholder="Description"
                    className="col-span-6 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number" value={item.quantity} min="0.01" step="0.01"
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    className="col-span-2 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number" value={item.unit_price} min="0" step="0.01"
                    onChange={e => updateItem(i, 'unit_price', e.target.value)}
                    placeholder="0.00"
                    className="col-span-3 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeItem(i)}
                    disabled={lineItems.length === 1}
                    className="col-span-1 text-gray-300 hover:text-red-400 disabled:opacity-20 text-lg leading-none text-center"
                  >×</button>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-gray-100">
              <button onClick={addItem} className="text-sm text-blue-600 hover:underline">+ Add line item</button>
            </div>

            {/* Totals */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {province ? (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Tax ({province}) — calculated on save</span>
                </div>
              ) : (
                <div className="flex justify-between text-xs text-amber-600">
                  <span>⚠ Set your province in Settings to auto-calculate tax</span>
                </div>
              )}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Quote'}
          </button>
        </div>
      )}
    </div>
  )
}
