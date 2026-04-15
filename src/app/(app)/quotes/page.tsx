import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-600',
  sent:     'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

export default async function QuotesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, clients(name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const counts = {
    all: quotes?.length ?? 0,
    sent: quotes?.filter(q => q.status === 'sent').length ?? 0,
    accepted: quotes?.filter(q => q.status === 'accepted').length ?? 0,
    draft: quotes?.filter(q => q.status === 'draft').length ?? 0,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Quotes</h1>
        <Link href="/quotes/new" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + New Quote
        </Link>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'All', count: counts.all },
          { label: 'Draft', count: counts.draft },
          { label: 'Sent', count: counts.sent },
          { label: 'Accepted', count: counts.accepted },
        ].map(({ label, count }) => (
          <span key={label} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
            {label} <span className="text-gray-400 ml-1">{count}</span>
          </span>
        ))}
      </div>

      {/* Quote list */}
      <div className="bg-white rounded-xl border border-gray-200">
        {!quotes?.length ? (
          <div className="px-4 py-12 text-center">
            <p className="text-2xl mb-2">📄</p>
            <p className="text-sm text-gray-500">No quotes yet</p>
            <Link href="/quotes/new" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
              Create your first quote →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {quotes.map((q) => (
              <Link key={q.id} href={`/quotes/${q.id}`}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{q.title}</p>
                    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[q.status] ?? ''}`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {q.quote_number}
                    {(q as unknown as { clients?: { name: string } }).clients?.name ? ` · ${(q as unknown as { clients?: { name: string } }).clients?.name}` : ''}
                    {' · '}{new Date(q.created_at).toLocaleDateString('en-CA')}
                  </p>
                </div>
                <div className="ml-4 shrink-0 text-right">
                  <p className="text-sm font-semibold text-gray-800">${Number(q.total).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{q.tax_type ?? 'No tax'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
