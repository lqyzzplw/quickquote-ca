import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — QuickQuote CA',
  description: 'Terms of service for QuickQuote CA, the AI-powered quote generator for Canadian tradespeople.',
}

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: April 20, 2026</p>

        <section className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Welcome to QuickQuote CA (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). These Terms of Service
            (&quot;Terms&quot;) govern your access to and use of the QuickQuote CA web application, website,
            and related services (collectively, the &quot;Service&quot;). By creating an account or using the
            Service, you agree to be bound by these Terms.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Eligibility</h2>
          <p>
            You must be at least 18 years old and capable of forming a legally binding contract to use the
            Service. The Service is designed for Canadian tradespeople and small businesses.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for all
            activity on your account. Notify us immediately of any unauthorized access.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. Free and Paid Plans</h2>
          <p>
            The Service offers a Free plan (3 quotes per month) and a Pro plan ($15 CAD per month, billed
            via Stripe). Pro subscriptions auto-renew monthly until cancelled. You can cancel any time from
            the Settings page; cancellation takes effect at the end of the current billing period.
          </p>
          <p>
            Prices exclude applicable Canadian sales taxes (GST/HST/PST/QST), which will be added at
            checkout based on your province of residence. Refunds are handled on a case-by-case basis;
            contact us within 14 days of a charge to request a refund.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Your Content</h2>
          <p>
            You retain ownership of all content you submit to the Service (&quot;Your Content&quot;), including
            client information, job descriptions, and generated quotes. You grant us a limited license to
            store, process, and display Your Content solely to provide the Service. We do not use Your
            Content to train AI models.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. AI-Generated Output</h2>
          <p>
            The Service uses third-party AI models (Anthropic Claude) to parse job descriptions into quote
            line items. AI output is provided as-is and may contain errors. You are responsible for
            reviewing every quote before sending it to a client. Tax calculations are based on current
            Canadian tax rates; verify rates with your accountant or the CRA before finalizing any quote
            for a significant amount.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the Service for fraudulent, illegal, or deceptive purposes</li>
            <li>Attempt to reverse engineer, scrape, or overload the Service</li>
            <li>Resell or white-label the Service without our written consent</li>
            <li>Upload malicious code, spam, or content that violates third-party rights</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Termination</h2>
          <p>
            We may suspend or terminate your account at any time if you breach these Terms. You may delete
            your account at any time from the Settings page; your data will be permanently deleted within
            30 days of account deletion.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT
            THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT QUOTE CALCULATIONS WILL BE ACCURATE IN
            EVERY CASE. YOU ASSUME FULL RESPONSIBILITY FOR QUOTES YOU SEND TO YOUR CLIENTS.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, our total liability arising out of or relating to the
            Service will not exceed the amount you paid us in the 12 months preceding the event giving rise
            to the claim.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of Canada and the province in which the account holder
            resides. Any disputes will be resolved in the courts of that province.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">11. Changes</h2>
          <p>
            We may update these Terms from time to time. Material changes will be announced via email or
            in-app notification at least 14 days before they take effect.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">12. Contact</h2>
          <p>
            Questions about these Terms? Contact us through the in-app support chat or reply to any email
            from QuickQuote CA.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
          See also: <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        </div>
      </article>
    </div>
  )
}
