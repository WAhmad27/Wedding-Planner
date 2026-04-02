'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createGuest, updateGuest } from '@/app/actions/guests'
import type { Guest } from '@/types'

interface GuestFormProps {
  open: boolean
  onClose: () => void
  weddingId: string
  guest?: Guest
}

export function GuestForm({ open, onClose, weddingId, guest }: GuestFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(guest)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = isEditing
      ? await updateGuest(guest!.id, formData)
      : await createGuest(weddingId, formData)
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
      title={isEditing ? 'Edit Guest' : 'Add Guest'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Full name</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={guest?.name ?? ''}
            className={inputClass}
            placeholder="e.g. Ahmed Khan"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Phone</label>
            <input
              name="phone"
              type="tel"
              defaultValue={guest?.phone ?? ''}
              className={inputClass}
              placeholder="+92 300 1234567"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              name="email"
              type="email"
              defaultValue={guest?.email ?? ''}
              className={inputClass}
              placeholder="optional"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Side</label>
            <select name="side" defaultValue={guest?.side ?? 'mutual'} className={inputClass}>
              <option value="bride">Bride&apos;s side</option>
              <option value="groom">Groom&apos;s side</option>
              <option value="mutual">Mutual</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>RSVP Status</label>
            <select name="rsvp_status" defaultValue={guest?.rsvp_status ?? 'pending'} className={inputClass}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={guest?.notes ?? ''}
            className={inputClass}
            placeholder="e.g. Vegetarian, needs wheelchair access…"
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
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Add guest'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
