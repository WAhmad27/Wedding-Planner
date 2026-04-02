'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createExpense, updateExpense } from '@/app/actions/budget'
import { CATEGORY_LABELS } from '@/lib/utils'
import type { Expense } from '@/types'

const CATEGORIES = Object.entries(CATEGORY_LABELS)

interface ExpenseFormProps {
  open: boolean
  onClose: () => void
  weddingId: string
  expense?: Expense
}

export function ExpenseForm({ open, onClose, weddingId, expense }: ExpenseFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(expense)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = isEditing
      ? await updateExpense(expense!.id, formData)
      : await createExpense(weddingId, formData)
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
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={expense?.category ?? 'venue'} className={inputClass} required>
            {CATEGORIES.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <input
            name="description"
            type="text"
            required
            defaultValue={expense?.description ?? ''}
            className={inputClass}
            placeholder="e.g. Venue booking deposit"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Amount (PKR)</label>
            <input
              name="amount"
              type="number"
              required
              min="0"
              step="1"
              defaultValue={expense?.amount ?? ''}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input
              name="expense_date"
              type="date"
              defaultValue={expense?.expense_date ?? ''}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Vendor name (optional)</label>
          <input
            name="vendor_name"
            type="text"
            defaultValue={expense?.vendor_name ?? ''}
            className={inputClass}
            placeholder="e.g. Lahore Gymkhana"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="paid"
              value="true"
              defaultChecked={expense?.paid ?? false}
              className="w-4 h-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-sm font-medium text-stone-700">Mark as paid</span>
          </label>
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
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Add expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
