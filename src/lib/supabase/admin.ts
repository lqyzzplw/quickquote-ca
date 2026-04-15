import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Admin client — bypasses RLS. Server-side only. Never expose to browser.
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
