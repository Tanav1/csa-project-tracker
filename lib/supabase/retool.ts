import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Server-only client for the TaskBoard (Retool) Supabase project.
// Uses the anon key — task_internal has permissive RLS (same key used for writes in app.py).
export function createRetoolClient() {
  return createSupabaseClient(
    process.env.RETOOL_SUPABASE_URL!,
    process.env.RETOOL_SUPABASE_ANON_KEY!
  )
}
