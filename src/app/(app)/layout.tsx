import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-gray-900">
          <span>⚡</span> QuickQuote CA
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/quotes/new" className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
            + New Quote
          </Link>
          <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-800">Settings</Link>
        </div>
      </nav>

      {/* Sidebar + content */}
      <div className="flex">
        <aside className="hidden md:flex flex-col w-48 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] pt-4 px-2">
          <NavLink href="/dashboard" icon="📋">Dashboard</NavLink>
          <NavLink href="/quotes" icon="📄">Quotes</NavLink>
          <NavLink href="/clients" icon="👥">Clients</NavLink>
        </aside>
        <main className="flex-1 p-4 md:p-6 max-w-4xl">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition">
      <span>{icon}</span> {children}
    </Link>
  )
}
