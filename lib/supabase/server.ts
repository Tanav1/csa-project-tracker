import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Uses service role key — auth is handled by NextAuth, not Supabase Auth.
// This bypasses RLS and is safe because all routes are protected by proxy.ts.
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
