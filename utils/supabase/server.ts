/**
 * Supabase Client for Server-Side
 * 
 * Use this in:
 * - Server Components (default in App Router)
 * - API Routes
 * - Server Actions
 * 
 * Security: Uses anon key, subject to Row Level Security (RLS)
 * Note: We're NOT using service role key as per requirements
 */

import { createClient } from '@supabase/supabase-js'

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}
