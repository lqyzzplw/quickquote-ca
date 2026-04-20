import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — QuickQuote CA',
  description: 'Privacy policy for QuickQuote CA. How we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
            <span>⚡</span> QuickQuote CA
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
            ← Back
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-gray">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: April 20, 2026</p>

        <section className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            This Privacy Policy explains how QuickQuote CA (&quot;we&quot;, &quot;us&quot;) collects, uses,
            and protects your personal information. We designed the Service to collect as little data as
            possible while still providing a useful product.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Information We Collect</h2>
          <p><strong>Account data.</strong> Email address, optionally your name and business name, and (for Pro users) your Stripe customer ID. If you sign in with Google, we also receive your Google profile name and picture.</p>
          <p><strong>Your business content.</strong> Client names, emails, addresses, job descriptions, quote line items, and generated PDFs. Stored encrypted at rest in Supabase (hosted in Canada, ca-central-1).</p>
          <p><strong>Usage data.</strong> Basic analytics on how many quotes you create, page views, and error logs. We do not use tracking cookies beyond what is necessary for authentication.</p>
          <p><strong>Payment data.</strong> Handled entirely by Stripe. We never see or store your credit card number.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. How We Use It</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide the Service — generate quotes, send PDFs, bill subscriptions</li>
            <li>To send transactional emails (quote delivery, password resets, billing receipts)</li>
            <li>To improve the product — aggregated, anonymized usage patterns only</li>
            <li>To respond to support requests</li>
          </ul>
          <p>We do <strong>not</strong> sell your data, share it with advertisers, or use your quote content to train AI models.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. Third-Party Services</h2>
          <p>We use the following subprocessors to operate the Service:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase</strong> — database and authentication (Canadian region)</li>
            <li><strong>Vercel</strong> — hosting</li>
            <li><strong>Anthropic (Claude)</strong> — AI job parsing. Job descriptions you enter are sent to Anthropic for processing; Anthropic&apos;s API does not retain prompts for training.</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Resend</strong> — email delivery (quote PDFs and transactional emails)</li>
            <li><strong>Google</strong> — optional sign-in via Google OAuth</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Data Location and Retention</h2>
          <p>
            Your data is stored in Supabase&apos;s Canadian data center (ca-central-1). We retain your data
            for as long as your account is active. If you delete your account, all personal data and business
            content is permanently deleted within 30 days, except where we are required to retain it for
            legal or financial compliance (e.g., invoice records for 6 years per Canadian tax law).
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Your Rights (PIPEDA)</h2>
          <p>Under Canadian privacy law (PIPEDA), you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal information we hold about you</li>
            <li>Request corrections to inaccurate information</li>
            <li>Withdraw consent and delete your account at any time</li>
            <li>File a complaint with the Office of the Privacy Commissioner of Canada</li>
          </ul>
          <p>To exercise any of these rights, contact us through in-app support.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Security</h2>
          <p>
            We use industry-standard security practices: HTTPS everywhere, database encryption at rest,
            row-level security on all user data, and no plain-text storage of credentials. No system is
            100% secure, but we aim to meet or exceed the standards expected of a Canadian SaaS.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Children</h2>
          <p>
            The Service is not intended for users under 18. We do not knowingly collect data from minors.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8. Changes</h2>
          <p>
            We may update this Privacy Policy occasionally. Material changes will be announced via email or
            in-app notification before they take effect.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9. Contact</h2>
          <p>
            Questions or concerns? Contact us through the in-app support chat or reply to any email from
            QuickQuote CA.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
          See also: <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
        </div>
      </article>
    </div>
  )
}
