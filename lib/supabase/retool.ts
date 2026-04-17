import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Anon client — task_internal (permissive RLS).
export function createRetoolClient() {
  return createSupabaseClient(
    process.env.RETOOL_SUPABASE_URL!,
    process.env.RETOOL_SUPABASE_ANON_KEY!
  )
}

// Service-role client — usage_events (bypasses RLS).
export function createRetoolServiceClient() {
  return createSupabaseClient(
    process.env.RETOOL_SUPABASE_URL!,
    process.env.RETOOL_SERVICE_KEY!
  )
}
