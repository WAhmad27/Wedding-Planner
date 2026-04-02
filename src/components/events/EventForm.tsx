'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createEvent, updateEvent } from '@/app/actions/events'
import type { WeddingEvent } from '@/types'

const EVENT_TYPES = [
  { value: 'mehndi', label: 'Mehndi' },
  { value: 'nikkah', label: 'Nikkah' },
  { value: 'barat', label: 'Barat' },
  { value: 'walima', label: 'Walima' },
  { value: 'other', label: 'Other' },
]

interface EventFormProps {
  open: boolean
  onClose: () => void
  weddingId: string
  event?: WeddingEvent
}

export function EventForm({ open, onClose, weddingId, event }: EventFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(event)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = isEditing
      ? await updateEvent(event!.id, formData)
      : await createEvent(weddingId, formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onClose()
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm bg-white'
  const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Event' : 'Add Event'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Event type</label>
          <select name="type" defaultValue={event?.type ?? 'mehndi'} className={inputClass} required>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Event name</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={event?.name ?? ''}
            className={inputClass}
            placeholder="e.g. Sara & Ahmed's Mehndi"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Date</label>
            <input
              name="date"
              type="date"
              defaultValue={event?.date ?? ''}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <input
              name="time"
              type="time"
              defaultValue={event?.time ?? ''}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Venue</label>
          <input
            name="venue"
            type="text"
            defaultValue={event?.venue ?? ''}
            className={inputClass}
            placeholder="e.g. Lahore Gymkhana"
          />
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={event?.notes ?? ''}
            className={inputClass}
            placeholder="Any additional details…"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Add event'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
