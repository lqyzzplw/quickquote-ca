import Link from 'next/link'
import { POSTS } from './posts'

export const metadata = {
  title: 'Blog — QuickQuote CA',
  description:
    'Practical guides on quoting, taxes, and running a trades business in Canada. Written for working tradespeople, not accountants.',
  alternates: { canonical: '/blog' },
}

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav (kept consistent with landing) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
            <span>⚡</span> QuickQuote CA
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-gray-900 font-medium">
              Blog
            </Link>
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

      <section className="pt-16 pb-12 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">Field Notes</h1>
          <p className="text-lg text-gray-600">
            Practical guides on quoting, taxes, and the paperwork side of trades. Written for tradespeople, not accountants.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {POSTS.map((p) => (
            <article
              key={p.slug}
              className="group border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-200 transition"
            >
              <Link href={`/blog/${p.slug}`} className="block space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <time dateTime={p.publishedAt}>
                    {new Date(p.publishedAt).toLocaleDateString('en-CA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>·</span>
                  <span>{p.readingMinutes} min read</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {p.title}
                </h2>
                <p className="text-gray-600">{p.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

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
