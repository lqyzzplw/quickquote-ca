'use client'

import { useEffect, useState } from 'react'

// Animated hero demo — runs a 10-second loop showing the product flow:
//   typing → AI parsing → line items appear → HST calculates → PDF slides in.
// Pure CSS + React state, no backend, no images, no external assets.
// Safe to ship: zero risk of API abuse, zero cost per pageview.

type Phase = 'typing' | 'parsing' | 'items' | 'tax' | 'total' | 'pdf' | 'hold'

const JOB_DESCRIPTION =
  'replace 40 gal hot water tank, 3 hrs labour at $85/hr, parts $450'

const LINE_ITEMS = [
  { desc: 'Labour — 3 hrs @ $85/hr', amount: '$255.00' },
  { desc: '40 gal hot water tank', amount: '$450.00' },
]

// Phase durations in ms. Total loop ≈ 10s.
const TIMINGS: Record<Phase, number> = {
  typing: 2200,
  parsing: 900,
  items: 1500,
  tax: 900,
  total: 700,
  pdf: 1300,
  hold: 2500,
}

const PHASE_ORDER: Phase[] = ['typing', 'parsing', 'items', 'tax', 'total', 'pdf', 'hold']

export default function HeroDemo() {
  const [phase, setPhase] = useState<Phase>('typing')
  const [typedText, setTypedText] = useState('')

  // Drive the phase cycle.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = PHASE_ORDER[(PHASE_ORDER.indexOf(phase) + 1) % PHASE_ORDER.length]
      if (next === 'typing') setTypedText('')
      setPhase(next)
    }, TIMINGS[phase])
    return () => clearTimeout(timer)
  }, [phase])

  // Typewriter effect during the typing phase.
  useEffect(() => {
    if (phase !== 'typing') return
    let i = 0
    const interval = setInterval(() => {
      i++
      setTypedText(JOB_DESCRIPTION.slice(0, i))
      if (i >= JOB_DESCRIPTION.length) clearInterval(interval)
    }, 35)
    return () => clearInterval(interval)
  }, [phase])

  // Convenience: which phases have already played (used to keep items visible).
  const reached = (target: Phase) =>
    PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf(target)

  return (
    <div className="relative w-full max-w-sm mx-auto md:mx-0 md:ml-auto">
      {/* App-window mockup */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-[11px] text-gray-400 font-medium">quickquote-ca.vercel.app / new quote</span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 min-h-[340px]">
          {/* Input */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Describe the job
            </label>
            <div className="mt-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 min-h-[60px] text-sm text-gray-800 font-mono leading-relaxed">
              {typedText}
              {phase === 'typing' && (
                <span className="inline-block w-1 h-4 bg-blue-500 ml-0.5 align-middle animate-pulse" />
              )}
            </div>
          </div>

          {/* Parsing indicator */}
          {phase === 'parsing' && (
            <div className="flex items-center gap-2 text-xs text-blue-600 animate-pulse">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              AI is parsing the job…
            </div>
          )}

          {/* Line items */}
          {reached('items') && phase !== 'parsing' && (
            <div className="space-y-1.5 pt-1">
              {LINE_ITEMS.map((item, i) => (
                <div
                  key={item.desc}
                  className="flex justify-between text-sm text-gray-700 transition-all duration-500"
                  style={{
                    opacity: 1,
                    transform: 'translateY(0)',
                    transitionDelay: `${i * 200}ms`,
                  }}
                >
                  <span>{item.desc}</span>
                  <span className="font-medium">{item.amount}</span>
                </div>
              ))}

              {/* Subtotal */}
              <div className="flex justify-between text-sm pt-2 border-t border-gray-100 text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">$705.00</span>
              </div>

              {/* HST line — highlighted when reached */}
              <div
                className={`flex justify-between text-sm transition-all duration-500 ${
                  reached('tax')
                    ? 'text-blue-700 bg-blue-50 -mx-2 px-2 py-1 rounded font-medium'
                    : 'text-gray-300'
                }`}
              >
                <span>HST (13% — Ontario)</span>
                <span>{reached('tax') ? '$91.65' : '—'}</span>
              </div>

              {/* Total */}
              <div
                className={`flex justify-between pt-2 mt-1 border-t border-gray-200 text-base font-bold transition-all duration-300 ${
                  reached('total') ? 'text-gray-900' : 'text-gray-300'
                }`}
              >
                <span>Total</span>
                <span>{reached('total') ? '$796.65' : '—'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF preview that slides in from the right when phase === 'pdf' or after */}
      <div
        className={`absolute -bottom-4 -right-4 sm:-right-6 w-32 h-40 bg-white rounded-lg shadow-2xl border border-gray-200 p-3 transition-all duration-700 ${
          reached('pdf')
            ? 'translate-x-0 opacity-100 rotate-3'
            : 'translate-x-8 opacity-0 rotate-12'
        }`}
        aria-hidden
      >
        <div className="text-[8px] font-bold text-blue-600 mb-1">QUOTE #2026-042</div>
        <div className="space-y-1">
          <div className="h-0.5 bg-gray-200 rounded w-full" />
          <div className="h-0.5 bg-gray-200 rounded w-4/5" />
          <div className="h-0.5 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="space-y-1 mt-2 pt-2 border-t border-gray-100">
          <div className="flex justify-between text-[7px] text-gray-500">
            <span>Labour</span><span>$255.00</span>
          </div>
          <div className="flex justify-between text-[7px] text-gray-500">
            <span>Tank</span><span>$450.00</span>
          </div>
          <div className="flex justify-between text-[7px] text-blue-600 font-medium">
            <span>HST 13%</span><span>$91.65</span>
          </div>
        </div>
        <div className="mt-2 pt-1 border-t border-gray-200 flex justify-between text-[9px] font-bold text-gray-900">
          <span>Total</span><span>$796.65</span>
        </div>
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow">
          PDF ✓
        </div>
      </div>
    </div>
  )
}
