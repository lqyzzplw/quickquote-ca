import Link from 'next/link'

const SITE_URL = 'https://quickquote-ca.vercel.app'
const POST_URL = `${SITE_URL}/blog/hst-on-contractor-quotes-ontario`
const PUBLISHED = '2026-05-25'

export const metadata = {
  title: 'How to Charge HST on Contractor Quotes in Ontario (2026 Guide)',
  description:
    'A practical HST guide for Ontario tradespeople: the $30k registration threshold, the 13% calculation, place-of-supply rules for cross-province jobs, input tax credits, and what your quotes must show.',
  alternates: { canonical: POST_URL },
  openGraph: {
    title: 'How to Charge HST on Contractor Quotes in Ontario (2026 Guide)',
    description:
      'When to register for HST, how to calculate it, cross-province rules, ITCs, and what quotes must show. Written for working tradespeople, not accountants.',
    url: POST_URL,
    type: 'article',
    publishedTime: PUBLISHED,
  },
}

const FAQ = [
  {
    q: 'Do I have to register for HST as a contractor in Ontario?',
    a: 'Only if your worldwide taxable revenue exceeds $30,000 CAD over any four consecutive calendar quarters (the Small Supplier threshold). Below that, registration is optional but often worth it for the input tax credits.',
  },
  {
    q: 'What rate of HST do I charge in Ontario?',
    a: '13% is the combined federal (GST) + provincial (PST) rate in Ontario. You charge it on the total quote — labour plus materials — for jobs supplied in Ontario.',
  },
  {
    q: 'I am based in Ontario but the job site is in Quebec. What tax do I charge?',
    a: 'For real-property work (renovations, plumbing, electrical, anything installed in or attached to a building), the place of supply is where the property is located. A Quebec job site means you charge GST + QST, not Ontario HST — even if you are based in the GTA.',
  },
  {
    q: 'What is an Input Tax Credit (ITC) and how do I claim it?',
    a: 'When you are HST-registered, you can claim back the HST you paid on business inputs — tools, gas, supplies, even your phone bill if used for work. You subtract those ITCs from the HST you collected from clients before remitting the net amount to CRA on your return.',
  },
  {
    q: 'Does my HST number need to appear on quotes and invoices?',
    a: 'Yes — once registered, every invoice over $30 must show your HST/GST number alongside the tax breakdown. Quotes do not legally require it but including it builds trust and avoids questions when the invoice arrives.',
  },
]

const ARTICLE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `${POST_URL}#article`,
      headline: 'How to Charge HST on Contractor Quotes in Ontario (2026 Guide)',
      description:
        'A practical HST guide for Ontario tradespeople: registration threshold, calculation, cross-province rules, input tax credits, and quote requirements.',
      url: POST_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      inLanguage: 'en-CA',
      author: { '@type': 'Organization', name: 'QuickQuote CA', url: SITE_URL },
      publisher: { '@type': 'Organization', name: 'QuickQuote CA', url: SITE_URL },
      mainEntityOfPage: POST_URL,
    },
    {
      '@type': 'FAQPage',
      '@id': `${POST_URL}#faq`,
      mainEntity: FAQ.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
}

export default function HSTPost() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* JSON-LD as text children — server-rendered, no dangerouslySetInnerHTML.
          Safe because ARTICLE_JSON_LD is a build-time constant, never user input. */}
      <script type="application/ld+json">{JSON.stringify(ARTICLE_JSON_LD)}</script>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
            <span>⚡</span> QuickQuote CA
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-gray-900 font-medium">Blog</Link>
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition">Sign in</Link>
            <Link href="/auth/signup" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-4 py-12">
        <header className="space-y-4 mb-10">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Link href="/blog" className="hover:text-gray-600 transition">← All posts</Link>
            <span>·</span>
            <time dateTime={PUBLISHED}>May 25, 2026</time>
            <span>·</span>
            <span>9 min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            How to Charge HST on Contractor Quotes in Ontario (2026 Guide)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            A practical guide for tradespeople in Ontario — when to register, how to calculate, what to put on your quote. No accountant jargon.
          </p>
        </header>

        <div className="prose prose-gray max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:my-4 prose-li:my-1">

          <p className="text-gray-700">
            If you&apos;ve just gone independent as a tradesperson in Ontario — drywall, plumbing, electrical, whatever — the HST question hits you within the first few quotes. Charge it? Not charge it? 13% on what exactly? What if the job is in Montreal? And do you have to remit every month?
          </p>

          <p>
            This guide is the version I wish someone had handed me. It&apos;s not legal advice and it doesn&apos;t replace a bookkeeper — but it covers the 90% of HST questions a working contractor in Ontario actually has.
          </p>

          <h2>1. Do you even need to charge HST?</h2>

          <p>
            CRA has a Small Supplier rule: <strong>if your worldwide taxable revenue is under $30,000 CAD over any four consecutive calendar quarters, you don&apos;t have to register for HST/GST.</strong> Below that, you don&apos;t charge tax on your quotes, you don&apos;t file HST returns, and CRA leaves you alone (for HST purposes — income tax is a separate story).
          </p>

          <p>
            The catch: the moment you cross $30k, you have 29 days to register. If you keep collecting without registering, CRA treats it as if you collected HST anyway and will come after the missing remittance with interest.
          </p>

          <h3>Why register voluntarily under $30k?</h3>

          <p>Two reasons most solo tradespeople register early:</p>

          <ul>
            <li><strong>Input Tax Credits (ITCs).</strong> Once registered, you can claim back the HST you paid on tools, gas, materials, your phone bill — the deductible work expenses pile up fast. Below the threshold you eat that tax.</li>
            <li><strong>Looking established.</strong> A quote without an HST number on it signals &quot;cash side hustle&quot; to commercial clients. With one, you look like a real business.</li>
          </ul>

          <p>
            The downside is paperwork: quarterly or annual HST returns, even if zero, and you have to actually charge the tax (so your quote totals go up 13%, which sometimes scares price-sensitive residential clients).
          </p>

          <h2>2. The 13% calculation</h2>

          <p>
            Ontario&apos;s HST rate is <strong>13%</strong> — that&apos;s 5% federal GST + 8% Ontario PST, combined into one tax called HST. You charge 13% on the total job price, labour and materials together.
          </p>

          <p>An example. A water heater replacement quote:</p>

          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto">
{`Labour:    3 hrs @ $85/hr     =  $255.00
Tank:      40 gal hot water    =  $450.00
                          ─────────────
Subtotal                       =  $705.00
HST (13%)                      =   $91.65
                          ─────────────
Total                          =  $796.65`}
          </pre>

          <p>
            You collect <strong>$796.65 total</strong>. The $91.65 isn&apos;t yours — it sits in your account until you remit it to CRA on your next return, minus any ITCs you&apos;re claiming back. <strong>Always keep HST collected in a separate bucket</strong> mentally; commingling it with operating cash is the #1 reason small contractors get a nasty surprise at filing time.
          </p>

          <h2>3. The place-of-supply trap: cross-province jobs</h2>

          <p>
            Here&apos;s where solo contractors get burned. You&apos;re registered in Ontario, you charge 13% HST. Then you take a basement reno job in Gatineau. Do you still charge 13%?
          </p>

          <p>
            <strong>No.</strong> For real-property work (anything attached to or installed in a building), CRA uses <strong>place-of-supply rules</strong>: the tax follows where the property is, not where your business is.
          </p>

          <p>So:</p>

          <ul>
            <li><strong>Ontario job site →</strong> HST 13%</li>
            <li><strong>BC job site →</strong> GST 5% + PST 7% (separately listed)</li>
            <li><strong>Quebec job site →</strong> GST 5% + QST 9.975% (and you may need a separate QST registration in QC)</li>
            <li><strong>Alberta job site →</strong> GST 5% only (no provincial sales tax in AB)</li>
          </ul>

          <p>
            Pure services that don&apos;t touch real property (consulting, design work) follow a different rule based on the client&apos;s billing address. Most working tradespeople never hit this — your work is on a physical job site, so place of supply is wherever your truck is parked that day.
          </p>

          <p>
            If you&apos;re crossing the border once a year for an outlier job, calling CRA&apos;s business line (1-800-959-5525) before quoting is faster than guessing. If it&apos;s a regular pattern, your bookkeeper earns their fee here.
          </p>

          <h2>4. Input Tax Credits — what you can claim back</h2>

          <p>
            Once you&apos;re registered, every dollar of HST you pay on business inputs is recoverable. You don&apos;t get cash back per receipt — you net it against the HST you owe on your return.
          </p>

          <p>Typical contractor ITCs:</p>

          <ul>
            <li>Tools and equipment</li>
            <li>Materials and supplies (when you&apos;re buying them for inventory, not for a specific reimbursable job)</li>
            <li>Gas, mileage, vehicle repairs (proportional to business use)</li>
            <li>Cell phone, business internet</li>
            <li>Software subscriptions (yes — accounting, quoting, scheduling tools)</li>
            <li>Sub-trades you hire (their HST becomes your ITC)</li>
          </ul>

          <p>
            Keep every receipt. CRA can ask for proof up to 6 years back. A photo of the receipt in a labelled folder works for solo operators — you don&apos;t need a full accounting system on day one.
          </p>

          <h2>5. What your quote (and invoice) needs to show</h2>

          <p>For quotes — strictly speaking, you&apos;re not required to show HST until the invoice. But best practice:</p>

          <ul>
            <li>Itemized line items (labour separated from materials helps the client understand the bill and is required for some warranty programs)</li>
            <li>Subtotal before tax</li>
            <li>HST line clearly labelled (&quot;HST (13%)&quot; — not just &quot;Tax&quot;)</li>
            <li>Total including HST</li>
            <li>Your HST/GST registration number, if registered</li>
            <li>Quote expiry date (industry standard: 30 days)</li>
          </ul>

          <p>
            When the quote becomes an invoice (job done, time to bill), CRA&apos;s rules kick in: invoices over $30 must show your HST number, the amount of HST charged, and the date of issue. Invoices over $150 add a few more requirements (buyer&apos;s name, brief description, terms).
          </p>

          <h2>6. Common mistakes I see</h2>

          <p><strong>Charging HST before you&apos;re registered.</strong> If you&apos;re below the $30k threshold and not registered, putting &quot;13% HST&quot; on a quote is technically misrepresentation. The fix is to register first (it&apos;s free, online, takes 15 minutes) or just quote tax-included totals without the HST line.</p>

          <p><strong>Forgetting place-of-supply on the first out-of-province job.</strong> The Quebec example above is the classic one. If you charged 13% HST when you should have charged QST, you owe Quebec the QST and the client doesn&apos;t owe you the difference — you eat it.</p>

          <p><strong>Rounding HST in your head and not in the file.</strong> A $703.45 subtotal &times; 13% = $91.4485, which CRA expects you to round to $91.45 (cents matter on the return). Eyeballed numbers add up over a year of quotes.</p>

          <p><strong>Spending the HST.</strong> The single most common solo-contractor mistake. The HST you collected isn&apos;t revenue — it&apos;s held for CRA. Open a separate savings sub-account and sweep 13% of every payment into it on day one.</p>

          <h2>7. Tooling — when a spreadsheet stops being enough</h2>

          <p>
            For your first 10–20 quotes, a Google Sheet with three columns (subtotal, HST, total) works fine. The pain points come later:
          </p>

          <ul>
            <li>You quote a BC job site and forget to switch from 13% HST to 5% GST + 7% PST</li>
            <li>You email a PDF that wasn&apos;t branded and the client asks &quot;is this real?&quot;</li>
            <li>You quote 6 jobs over a weekend and can&apos;t remember what you sent who</li>
          </ul>

          <p>
            That&apos;s why we built <Link href="/" className="font-medium">QuickQuote CA</Link> — a tool that takes a plain-English job description (&quot;replace 40 gal hot water tank, 3 hrs labour at $85/hr, parts $450&quot;) and produces a properly itemized PDF quote with the right Canadian tax based on the client&apos;s province. Free tier is 3 quotes per month so you can test it on real jobs before paying for anything. Pro is $15 CAD/month for unlimited.
          </p>

          <p>
            But honestly — whether you use our tool or any other, the single highest-leverage change a new tradesperson can make is to <strong>stop typing quotes in Word</strong>. The next client who&apos;s comparing you to two other contractors is judging your professionalism by your quote PDF as much as by your handshake.
          </p>

          <h2>FAQ</h2>

          <div className="not-prose space-y-3">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-gray-50 border border-gray-200 rounded-xl p-4"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-gray-900 text-base">{q}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>

          <hr className="my-10 border-gray-200" />

          <p className="text-sm text-gray-500 italic">
            This guide is general information based on CRA rules as of May 2026. Tax thresholds, rates, and registration rules can change — verify with the <a href="https://www.canada.ca/en/services/taxes/businesses.html" target="_blank" rel="noreferrer">CRA business site</a> or a Canadian bookkeeper before relying on it for a specific business decision.
          </p>
        </div>

        {/* End CTA */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center space-y-3">
          <h2 className="text-xl font-bold text-gray-900">Stop hand-calculating HST on every quote</h2>
          <p className="text-gray-600">
            QuickQuote CA handles HST, GST + PST, and QST automatically for all 13 provinces and territories. Free for 3 quotes a month.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition"
          >
            Try it free
          </Link>
        </div>
      </article>

      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>⚡ QuickQuote CA — Made in Canada 🇨🇦</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link href="/blog" className="hover:text-gray-600 transition">Blog</Link>
            <Link href="/#faq" className="hover:text-gray-600 transition">FAQ</Link>
            <Link href="/terms" className="hover:text-gray-600 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition">Privacy</Link>
            <Link href="/auth/login" className="hover:text-gray-600 transition">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
