import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Server-only client for the FormFilling Supabase project.
// Uses the service role key to bypass RLS on analytics_events (no public policies).
export function createFormFillingClient() {
  return createSupabaseClient(
    process.env.FORM_FILLING_SUPABASE_URL!,
    process.env.FORM_FILLING_SERVICE_KEY!
  )
}
