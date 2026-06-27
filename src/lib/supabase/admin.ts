import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Admin client — bypasses RLS. Server-side only. Never expose to browser.
// Lazily instantiated: creating it at module load throws "supabaseUrl is required"
// during `next build` page-data collection when env vars are absent (e.g. Preview
// deployments without the Production env). Defer creation to first real use.
let _adminClient: SupabaseClient<Database> | null = null

export function getAdminClient(): SupabaseClient<Database> {
  if (!_adminClient) {
    _adminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}
