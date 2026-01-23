/**
 * Notes Client Component
 * 
 * Handles client-side interactivity:
 * - Creating new notes
 * - Real-time UI updates
 * - Form handling
 * 
 * Uses API routes for data mutations
 */

'use client'

import { useState } from 'react'

type Note = {
  id: number
  title: string
}

export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [newTitle, setNewTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTitle.trim()) {
      setError('Title cannot be empty')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create note')
      }

      // Add new note to the top of the list
      setNotes([data.note, ...notes])
      setNewTitle('')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Create Note Form */}
      <form onSubmit={handleCreateNote} style={{ marginBottom: '2rem' }}>
        <h2>Create New Note</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter note title..."
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
            }}
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              fontWeight: '500',
            }}
          >
            {isCreating ? '...' : 'Create'}
          </button>
        </div>
        {error && (
          <p style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}
      </form>

      {/* Notes List */}
      <h2>All Notes ({notes.length})</h2>
      {notes.length === 0 ? (
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
          No notes yet. Create one above!
        </p>
      ) : (
        <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0 }}>
          {notes.map((note) => (
            <li
              key={note.id}
              style={{
                padding: '1rem',
                marginBottom: '0.5rem',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            >
              <strong>#{note.id}</strong> - {note.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
