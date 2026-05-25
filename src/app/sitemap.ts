import type { MetadataRoute } from 'next'
import { POSTS } from './blog/posts'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://quickquote-ca.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const blogPostEntries: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    { url: `${SITE_URL}/`,            lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/blog`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    ...blogPostEntries,
    { url: `${SITE_URL}/auth/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/auth/login`,  lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/privacy`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
