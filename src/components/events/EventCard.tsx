'use client'

import { useState } from 'react'
import { MapPin, Calendar, Clock, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EventForm } from './EventForm'
import { deleteEvent } from '@/app/actions/events'
import { formatDate, formatTime, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/utils'
import type { WeddingEvent } from '@/types'

interface EventCardProps {
  event: WeddingEvent
  weddingId: string
  guestCount?: number
}

export function EventCard({ event, weddingId, guestCount = 0 }: EventCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${event.name}"? This cannot be undone.`)) return
    setDeleting(true)
    await deleteEvent(event.id)
    setDeleting(false)
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={EVENT_TYPE_COLORS[event.type]}>
              {EVENT_TYPE_LABELS[event.type]}
            </Badge>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditOpen(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-stone-900 text-sm mb-3">{event.name}</h3>

        <div className="space-y-1.5">
          {event.date && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{formatDate(event.date)}</span>
              {event.time && (
                <>
                  <Clock className="w-3.5 h-3.5 shrink-0 ml-1" />
                  <span>{formatTime(event.time)}</span>
                </>
              )}
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          )}
        </div>

        {guestCount > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <span className="text-xs text-stone-400">{guestCount} guests assigned</span>
          </div>
        )}
      </div>

      <EventForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        weddingId={weddingId}
        event={event}
      />
    </>
  )
}
