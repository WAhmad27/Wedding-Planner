'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { EventCard } from '@/components/events/EventCard'
import { EventForm } from '@/components/events/EventForm'
import type { WeddingEvent } from '@/types'

interface EventsClientProps {
  events: WeddingEvent[]
  weddingId: string
}

export function EventsClient({ events, weddingId }: EventsClientProps) {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Events</h1>
          <p className="text-sm text-stone-500 mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <div className="text-4xl mb-3">🗓️</div>
          <p className="text-sm font-medium text-stone-900 mb-1">No events yet</p>
          <p className="text-sm text-stone-400 mb-4">Add your Mehndi, Barat, Walima and more</p>
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Add first event
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} weddingId={weddingId} />
          ))}
        </div>
      )}

      <EventForm
        open={addOpen}
        onClose={() => setAddOpen(false)}
        weddingId={weddingId}
      />
    </>
  )
}
