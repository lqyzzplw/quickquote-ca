// Central registry of blog posts.
// Each post owns its own page.tsx for full layout/SEO control, but this
// file is the single source of truth for listing, sitemap, and nav links.
//
// To add a new post:
//   1. Create src/app/blog/<slug>/page.tsx
//   2. Append a new entry below (sorted newest first)
//   3. Sitemap and index page pick it up automatically

export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string // ISO date
  readingMinutes: number
  tags: string[]
}

export const POSTS: BlogPost[] = [
  {
    slug: 'hst-on-contractor-quotes-ontario',
    title: 'How to Charge HST on Contractor Quotes in Ontario (2026 Guide)',
    description:
      'A practical guide for Ontario tradespeople: when to register for HST, how to calculate it, place-of-supply rules for cross-province jobs, input tax credits, and what your quotes need to show.',
    publishedAt: '2026-05-25',
    readingMinutes: 9,
    tags: ['HST', 'Ontario', 'Tax', 'Contractors'],
  },
]
