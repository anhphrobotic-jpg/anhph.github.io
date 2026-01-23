/**
 * API Route: /api/notes
 * 
 * Backend endpoint for managing notes in Supabase
 * 
 * Supports:
 * - GET: Fetch all notes
 * - POST: Create a new note
 * 
 * TODO:
 * - Add PUT for updates
 * - Add DELETE for deletions
 * - Add authentication
 * - Add input validation with Zod
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'

// Database type (matches Supabase table)
type Note = {
  id: number
  title: string
}

/**
 * GET /api/notes
 * Returns list of all notes
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ notes: data })
    
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notes
 * Creates a new note
 * 
 * Body: { title: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basic validation
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      )
    }
    
    if (body.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      )
    }
    
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('notes')
      .insert([{ title: body.title.trim() }])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ note: data }, { status: 201 })
    
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
