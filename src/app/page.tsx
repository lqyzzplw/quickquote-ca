import Link from 'next/link'

export const metadata = {
  title: 'QuickQuote CA — Professional Quotes for Canadian Tradespeople',
  description: 'Generate AI-powered PDF quotes with correct Canadian tax logic in seconds. Built for contractors, electricians, plumbers, and every trade in between.',
}

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Job Parsing',
    body: 'Paste a job description and let Claude AI break it into professional line items instantly.',
  },
  {
    icon: '🇨🇦',
    title: 'Canadian Tax Engine',
    body: 'Correct HST, GST+PST, and GST+QST calculations for all 13 provinces and territories — automatically.',
  },
  {
    icon: '📄',
    title: 'Branded PDF Quotes',
    body: 'Polished PDF with your business name, quote number, itemised costs, and tax breakdown.',
  },
  {
    icon: '📧',
    title: 'Email Delivery',
    body: 'Send the quote PDF directly to your client from the app. No downloading, no attaching.',
  },
  {
    icon: '👥',
    title: 'Client Management',
    body: 'Save client contact info and pull it into any quote with a single tap.',
  },
  {
    icon: '📊',
    title: 'Quote Tracking',
    body: 'See which quotes are sent, accepted, or declined at a glance from your dashboard.',
  },
]

const TRADES = [
  'General Contractors', 'Electricians', 'Plumbers', 'HVAC Technicians',
  'Roofers', 'Painters', 'Landscapers', 'Renovators', 'Flooring Installers',
  'Deck Builders', 'Handymen', 'Welders',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
            <span>⚡</span> QuickQuote CA
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-16 pb-20 px-4 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            Built for Canadian Trades
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Professional quotes in{' '}
            <span className="text-blue-600">under 60 seconds</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Describe the job, get an itemised quote with the right Canadian taxes, and email a branded PDF to your client — all from your phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition text-base"
            >
              Start free — 3 quotes/month
            </Link>
            <Link
              href="#pricing"
              className="border border-gray-300 text-gray-700 font-medium px-8 py-3.5 rounded-xl hover:bg-gray-50 transition text-base"
            >
              See pricing
            </Link>
          </div>
          <p className="text-xs text-gray-400">No credit card required to start.</p>
        </div>
      </section>

      {/* ─── Social proof ─── */}
      <section className="py-10 px-4 bg-gray-50 border-y border-gray-200">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Built for every trade in Canada
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {TRADES.map((t) => (
              <span key={t} className="bg-white border border-gray-200 text-gray-600 text-sm px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 px-4" id="features">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to quote faster</h2>
            <p className="text-gray-500 mt-3">Stop wasting evenings on spreadsheets. QuickQuote handles the paperwork.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, body }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 hover:shadow-sm transition">
                <span className="text-3xl">{icon}</span>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <h2 className="text-3xl font-bold">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8 text-left">
            {[
              { step: '1', title: 'Describe the job', body: 'Type or paste what the job involves. Our AI breaks it into professional line items.' },
              { step: '2', title: 'Review & adjust', body: 'Edit quantities and prices, pick your province, and Canadian taxes calculate automatically.' },
              { step: '3', title: 'Send the quote', body: 'Hit send. Your client gets a professional PDF quote in their inbox instantly.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  {step}
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-blue-100 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="py-20 px-4" id="pricing">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Simple, honest pricing</h2>
            <p className="text-gray-500 mt-3">Start free, upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Free</h3>
                <div className="mt-2">
                  <span className="text-3xl font-extrabold text-gray-900">$0</span>
                  <span className="text-gray-500 ml-1">/ month</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                {['3 quotes per month', 'AI job parsing', 'PDF generation & email', 'Canadian tax engine'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block text-center border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white border-2 border-blue-500 rounded-2xl p-6 space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Pro</h3>
                <div className="mt-2">
                  <span className="text-3xl font-extrabold text-gray-900">$15</span>
                  <span className="text-gray-500 ml-1">CAD / month</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Cancel any time.</p>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  'Everything in Free',
                  'Unlimited quotes',
                  'Priority support',
                  'New features first',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-blue-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block text-center bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition"
              >
                Start free, upgrade later
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 px-4 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to quote faster?</h2>
          <p className="text-gray-400">
            Join Canadian tradespeople who are winning more jobs with professional quotes sent in under a minute.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition"
          >
            Create your free account
          </Link>
          <p className="text-xs text-gray-500">No credit card required. Start sending quotes today.</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>⚡ QuickQuote CA — Made in Canada 🇨🇦</span>
          <div className="flex gap-6">
            <Link href="/auth/login" className="hover:text-gray-600 transition">Sign in</Link>
            <Link href="/auth/signup" className="hover:text-gray-600 transition">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
