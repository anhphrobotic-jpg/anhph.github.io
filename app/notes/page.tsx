/**
 * Notes Page - Server Component with Supabase Integration
 * 
 * This page demonstrates:
 * 1. Server-side data fetching
 * 2. Supabase integration
 * 3. Progressive enhancement
 * 
 * Data is fetched on the server, then enhanced with client-side interactivity.
 */

import { createServerSupabaseClient } from '@/utils/supabase/server'
import NotesClient from './NotesClient'

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic'

export default async function NotesPage() {
  const supabase = createServerSupabaseClient()
  
  // Fetch notes on the server
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .order('id', { ascending: false })
  
  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h1>Error Loading Notes</h1>
        <p>{error.message}</p>
        <p>Check your Supabase configuration and database setup.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📝 Notes (Supabase Integration Demo)</h1>
      
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #22c55e' }}>
        <p>✅ Successfully connected to Supabase!</p>
        <p>Found {notes?.length || 0} notes in database.</p>
      </div>

      {/* Client component for interactivity */}
      <NotesClient initialNotes={notes || []} />
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
        <h3>📚 Database Info</h3>
        <ul style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          <li>Table: <code>notes</code></li>
          <li>Columns: <code>id</code> (bigint), <code>title</code> (text)</li>
          <li>RLS: Enabled with public SELECT policy</li>
        </ul>
      </div>
    </div>
  )
}
