import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Vercel Cron — keeps the Supabase free-tier project from auto-pausing after
// 7 days of inactivity. Performs a tiny authenticated read against the DB.
// Schedule lives in vercel.json. Auth: Vercel sets `Authorization: Bearer $CRON_SECRET`
// on cron-triggered requests; we verify it before running.

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { error } = await supabase
    .from('quotes')
    .select('id', { count: 'exact', head: true })

  if (error) {
    return NextResponse.json(
      { ok: false, at: new Date().toISOString(), error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() })
}
