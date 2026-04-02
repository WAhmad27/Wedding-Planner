'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createNote, updateNote } from '@/app/actions/notes'
import type { Note, WeddingEvent } from '@/types'

interface NoteFormProps {
  open: boolean
  onClose: () => void
  weddingId: string
  events: WeddingEvent[]
  note?: Note
}

export function NoteForm({ open, onClose, weddingId, events, note }: NoteFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(note)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = isEditing
      ? await updateNote(note!.id, formData)
      : await createNote(weddingId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
    else { onClose(); setLoading(false) }
  }

  const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm bg-white'
  const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5'

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Note' : 'New Note'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Title</label>
          <input name="title" type="text" required defaultValue={note?.title ?? ''} className={inputClass} placeholder="e.g. Venue contact details" />
        </div>
        {events.length > 0 && (
          <div>
            <label className={labelClass}>Link to event (optional)</label>
            <select name="event_id" defaultValue={note?.event_id ?? ''} className={inputClass}>
              <option value="">No event</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={labelClass}>Content</label>
          <textarea
            name="content"
            rows={6}
            defaultValue={note?.content ?? ''}
            className={inputClass}
            placeholder="Write your note here…"
          />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-colors text-sm">
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Save note'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
