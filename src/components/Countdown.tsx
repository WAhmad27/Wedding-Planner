'use client'

import { daysUntil } from '@/lib/utils'

interface CountdownProps {
  weddingDate: string | null
  weddingTitle: string
}

export function Countdown({ weddingDate, weddingTitle }: CountdownProps) {
  const days = daysUntil(weddingDate)
  if (days === null) return null

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-5 text-center">
      {days > 0 ? (
        <>
          <p className="text-xs font-medium text-rose-500 uppercase tracking-wide mb-1">Countdown</p>
          <p className="text-4xl font-bold text-rose-700 mb-1">{days}</p>
          <p className="text-sm text-rose-500">day{days !== 1 ? 's' : ''} until {weddingTitle}</p>
        </>
      ) : days === 0 ? (
        <>
          <p className="text-2xl font-bold text-rose-700 mb-1">🎊 Today is the day!</p>
          <p className="text-sm text-rose-500">{weddingTitle}</p>
        </>
      ) : (
        <>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">Wedding was</p>
          <p className="text-4xl font-bold text-stone-600 mb-1">{Math.abs(days)}</p>
          <p className="text-sm text-stone-400">day{Math.abs(days) !== 1 ? 's' : ''} ago</p>
        </>
      )}
    </div>
  )
}
