'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import { NoteForm } from '@/components/notes/NoteForm'
import { deleteNote } from '@/app/actions/notes'
import { formatDate, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Note, WeddingEvent } from '@/types'

interface NotesClientProps {
  notes: Note[]
  events: WeddingEvent[]
  weddingId: string
}

export function NotesClient({ notes, events, weddingId }: NotesClientProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editNote, setEditNote] = useState<Note | null>(null)

  const eventMap = Object.fromEntries(events.map((e) => [e.id, e]))

  async function handleDelete(note: Note) {
    if (!confirm(`Delete "${note.title}"?`)) return
    await deleteNote(note.id)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Notes</h1>
          <p className="text-sm text-stone-500 mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-sm font-medium text-stone-900 mb-1">No notes yet</p>
          <p className="text-sm text-stone-400 mb-4">Keep track of important details, contacts, and ideas</p>
          <button onClick={() => setAddOpen(true)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm">
            Add first note
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => {
            const linkedEvent = note.event_id ? eventMap[note.event_id] : null
            return (
              <div key={note.id} className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <h3 className="font-semibold text-stone-900 text-sm">{note.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditNote(note)} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(note)} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {linkedEvent && (
                  <div className="mb-2">
                    <Badge className={EVENT_TYPE_COLORS[linkedEvent.type]}>
                      {EVENT_TYPE_LABELS[linkedEvent.type]} · {linkedEvent.name}
                    </Badge>
                  </div>
                )}

                {note.content && (
                  <p className="text-sm text-stone-600 flex-1 whitespace-pre-wrap line-clamp-5 mt-1">
                    {note.content}
                  </p>
                )}

                <p className="text-xs text-stone-400 mt-3 pt-3 border-t border-stone-100">
                  {note.updated_at !== note.created_at ? `Updated ${formatDate(note.updated_at)}` : formatDate(note.created_at)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <NoteForm open={addOpen} onClose={() => setAddOpen(false)} weddingId={weddingId} events={events} />
      {editNote && (
        <NoteForm open={Boolean(editNote)} onClose={() => setEditNote(null)} weddingId={weddingId} events={events} note={editNote} />
      )}
    </>
  )
}
