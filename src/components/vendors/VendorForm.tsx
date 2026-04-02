'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createVendor, updateVendor } from '@/app/actions/vendors'
import { CATEGORY_LABELS } from '@/lib/utils'
import type { Vendor } from '@/types'

const TYPES = Object.entries(CATEGORY_LABELS)

interface VendorFormProps {
  open: boolean
  onClose: () => void
  weddingId: string
  vendor?: Vendor
}

export function VendorForm({ open, onClose, weddingId, vendor }: VendorFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(vendor)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = isEditing
      ? await updateVendor(vendor!.id, formData)
      : await createVendor(weddingId, formData)
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
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Vendor' : 'Add Vendor'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Vendor name</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={vendor?.name ?? ''}
              className={inputClass}
              placeholder="e.g. Royal Catering"
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select name="type" defaultValue={vendor?.type ?? 'catering'} className={inputClass} required>
              {TYPES.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Phone</label>
            <input
              name="phone"
              type="tel"
              defaultValue={vendor?.phone ?? ''}
              className={inputClass}
              placeholder="+92 300 1234567"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              name="email"
              type="email"
              defaultValue={vendor?.email ?? ''}
              className={inputClass}
              placeholder="optional"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Service description</label>
          <input
            name="service_description"
            type="text"
            defaultValue={vendor?.service_description ?? ''}
            className={inputClass}
            placeholder="e.g. Full catering for 500 guests"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Total cost (PKR)</label>
            <input
              name="total_cost"
              type="number"
              min="0"
              step="1"
              defaultValue={vendor?.total_cost ?? ''}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Amount paid (PKR)</label>
            <input
              name="amount_paid"
              type="number"
              min="0"
              step="1"
              defaultValue={vendor?.amount_paid ?? 0}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Booking status</label>
          <select name="status" defaultValue={vendor?.status ?? 'pending'} className={inputClass}>
            <option value="pending">Pending</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={vendor?.notes ?? ''}
            className={inputClass}
            placeholder="Contract details, special requirements…"
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
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Add vendor'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
