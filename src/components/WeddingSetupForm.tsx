'use client'

import { useState } from 'react'
import { createWedding } from '@/app/actions/wedding'

export function WeddingSetupForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await createWedding(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm'
  const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5'

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">💍</div>
          <h2 className="text-lg font-semibold text-stone-900">Set up your wedding</h2>
          <p className="text-sm text-stone-500 mt-1">Fill in the details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Wedding title</label>
            <input
              name="title"
              type="text"
              required
              className={inputClass}
              placeholder="e.g. Sara & Ahmed's Wedding"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Bride&apos;s name</label>
              <input name="bride_name" type="text" className={inputClass} placeholder="Sara" />
            </div>
            <div>
              <label className={labelClass}>Groom&apos;s name</label>
              <input name="groom_name" type="text" className={inputClass} placeholder="Ahmed" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Wedding date</label>
            <input name="wedding_date" type="date" className={inputClass} />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {loading ? 'Creating…' : 'Create my wedding'}
          </button>
        </form>
      </div>
    </div>
  )
}
