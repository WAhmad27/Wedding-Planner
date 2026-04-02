'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Guest, Wedding } from '@/types'

interface RSVPClientProps {
  guest: Guest
  wedding: Wedding
}

export function RSVPClient({ guest, wedding }: RSVPClientProps) {
  const [status, setStatus] = useState<'confirmed' | 'declined' | 'pending'>(guest.rsvp_status)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRSVP(newStatus: 'confirmed' | 'declined') {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('guests')
      .update({ rsvp_status: newStatus })
      .eq('rsvp_token', guest.rsvp_token)
    if (err) {
      setError('Could not save your response. Please try again.')
    } else {
      setStatus(newStatus)
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💍</div>
          <h1 className="text-2xl font-semibold text-stone-900">{wedding.title}</h1>
          {wedding.bride_name && wedding.groom_name && (
            <p className="text-stone-500 mt-1">{wedding.bride_name} & {wedding.groom_name}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
          {saved ? (
            <div>
              <div className="text-5xl mb-4">
                {status === 'confirmed' ? '🎉' : '😢'}
              </div>
              <h2 className="text-lg font-semibold text-stone-900 mb-2">
                {status === 'confirmed' ? 'You\'re coming!' : 'We\'ll miss you'}
              </h2>
              <p className="text-sm text-stone-500">
                {status === 'confirmed'
                  ? 'We\'re so excited to celebrate with you!'
                  : 'Thank you for letting us know.'}
              </p>
              <button
                onClick={() => setSaved(false)}
                className="mt-4 text-sm text-rose-600 hover:text-rose-700 font-medium"
              >
                Change response
              </button>
            </div>
          ) : (
            <div>
              <p className="text-stone-500 text-sm mb-1">You have been invited to</p>
              <h2 className="text-lg font-semibold text-stone-900 mb-1">{wedding.title}</h2>
              <p className="text-stone-700 font-medium mb-6">
                Dear {guest.name},<br />
                <span className="text-sm font-normal text-stone-500">will you be joining us?</span>
              </p>

              {status !== 'pending' && (
                <div className={`mb-4 px-3 py-2 rounded-lg text-sm font-medium ${status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                  Your current response: {status === 'confirmed' ? 'Attending ✓' : 'Not attending'}
                </div>
              )}

              {error && (
                <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleRSVP('confirmed')}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-xl transition-colors text-sm"
                >
                  {loading ? '…' : 'Yes, I\'ll be there 🎉'}
                </button>
                <button
                  onClick={() => handleRSVP('declined')}
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium rounded-xl transition-colors text-sm"
                >
                  {loading ? '…' : 'Sorry, can\'t make it'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
