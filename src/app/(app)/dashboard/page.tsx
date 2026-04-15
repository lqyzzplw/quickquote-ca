import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: recentQuotes }, { data: stats }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user!.id).single(),
    supabase.from('quotes').select('*, clients(name)').eq('user_id', user!.id)
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('quotes').select('status').eq('user_id', user!.id),
  ])

  const quoteCounts = {
    total: stats?.length ?? 0,
    sent: stats?.filter(q => q.status === 'sent').length ?? 0,
    accepted: stats?.filter(q => q.status === 'accepted').length ?? 0,
    draft: stats?.filter(q => q.status === 'draft').length ?? 0,
  }

  const isFree = profile?.plan === 'free'
  const sentThisMonth = profile?.quotes_sent_this_month ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back{profile?.business_name ? `, ${profile.business_name}` : ''}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isFree ? `${sentThisMonth}/3 free quotes used this month` : 'Pro plan — unlimited quotes'}
        </p>
      </div>

      {/* Freemium banner */}
      {isFree && sentThisMonth >= 3 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">You&apos;ve used all 3 free quotes this month</p>
            <p className="text-xs text-amber-600 mt-0.5">Upgrade to Pro for $15 CAD/month — unlimited quotes</p>
          </div>
          <Link href="/upgrade" className="bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-600 transition whitespace-nowrap ml-4">
            Upgrade
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Quotes', value: quoteCounts.total, color: 'text-gray-900' },
          { label: 'Sent', value: quoteCounts.sent, color: 'text-blue-600' },
          { label: 'Accepted', value: quoteCounts.accepted, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent quotes */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Recent Quotes</h2>
          <Link href="/quotes" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        {!recentQuotes?.length ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-400">No quotes yet</p>
            <Link href="/quotes/new" className="mt-2 inline-block text-sm text-blue-600 hover:underline">Create your first quote →</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentQuotes.map((q: any) => (
              <Link key={q.id} href={`/quotes/${q.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition">
                <div>
                  <p className="text-sm font-medium text-gray-900">{q.title}</p>
                  <p className="text-xs text-gray-400">{q.clients?.name ?? 'No client'} · {q.quote_number}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">${Number(q.total).toFixed(2)}</span>
                  <StatusBadge status={q.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${map[status] ?? ''}`}>
      {status}
    </span>
  )
}
