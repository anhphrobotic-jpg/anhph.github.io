/**
 * Supabase Client for Browser/Client-Side
 * 
 * Use this in:
 * - Client Components (use client)
 * - Browser-side JavaScript
 * - Interactive features
 * 
 * Security: Uses anon key, subject to Row Level Security (RLS)
 */

import { createClient } from '@supabase/supabase-js'

// Client-side environment variables (public)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
