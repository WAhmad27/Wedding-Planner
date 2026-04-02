'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, Download, Link2, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { GuestForm } from '@/components/guests/GuestForm'
import { GuestImport } from '@/components/guests/GuestImport'
import { deleteGuest } from '@/app/actions/guests'
import type { Guest, RSVPStatus, GuestSide } from '@/types'

function exportGuestsCSV(guests: Guest[]) {
  const headers = ['Name', 'Phone', 'Email', 'Side', 'RSVP Status', 'Notes']
  const rows = guests.map((g) => [
    g.name,
    g.phone ?? '',
    g.email ?? '',
    g.side,
    g.rsvp_status,
    g.notes ?? '',
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'guest-list.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function copyRSVPLink(token: string) {
  const url = `${window.location.origin}/rsvp/${token}`
  navigator.clipboard.writeText(url)
}

const RSVP_COLORS: Record<RSVPStatus, string> = {
  confirmed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  declined: 'bg-stone-100 text-stone-600',
}

const SIDE_LABELS: Record<GuestSide, string> = {
  bride: "Bride's",
  groom: "Groom's",
  mutual: 'Mutual',
}

interface GuestsClientProps {
  guests: Guest[]
  weddingId: string
}

export function GuestsClient({ guests, weddingId }: GuestsClientProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | null>(null)
  const [search, setSearch] = useState('')
  const [sideFilter, setSideFilter] = useState<GuestSide | 'all'>('all')
  const [rsvpFilter, setRsvpFilter] = useState<RSVPStatus | 'all'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.phone ?? '').includes(search)
      const matchSide = sideFilter === 'all' || g.side === sideFilter
      const matchRsvp = rsvpFilter === 'all' || g.rsvp_status === rsvpFilter
      return matchSearch && matchSide && matchRsvp
    })
  }, [guests, search, sideFilter, rsvpFilter])

  const confirmed = guests.filter((g) => g.rsvp_status === 'confirmed').length
  const pending = guests.filter((g) => g.rsvp_status === 'pending').length
  const declined = guests.filter((g) => g.rsvp_status === 'declined').length

  async function handleDelete(guest: Guest) {
    if (!confirm(`Remove ${guest.name}?`)) return
    setDeleting(guest.id)
    await deleteGuest(guest.id)
    setDeleting(null)
  }

  const selectClass =
    'px-3 py-2 rounded-lg border border-stone-300 text-stone-700 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500'

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Guests</h1>
          <p className="text-sm text-stone-500 mt-0.5">{guests.length} total</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {guests.length > 0 && (
            <button
              onClick={() => exportGuestsCSV(guests)}
              className="flex items-center gap-2 px-3 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 px-3 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium rounded-lg transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add guest
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {guests.length > 0 && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {[
            { label: 'Confirmed', count: confirmed, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { label: 'Pending', count: pending, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { label: 'Declined', count: declined, color: 'text-stone-600 bg-stone-50 border-stone-200' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${color}`}>
              {label}: {count}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          />
        </div>
        <select value={sideFilter} onChange={(e) => setSideFilter(e.target.value as GuestSide | 'all')} className={selectClass}>
          <option value="all">All sides</option>
          <option value="bride">Bride&apos;s side</option>
          <option value="groom">Groom&apos;s side</option>
          <option value="mutual">Mutual</option>
        </select>
        <select value={rsvpFilter} onChange={(e) => setRsvpFilter(e.target.value as RSVPStatus | 'all')} className={selectClass}>
          <option value="all">All RSVPs</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Table */}
      {guests.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-sm font-medium text-stone-900 mb-1">No guests yet</p>
          <p className="text-sm text-stone-400 mb-4">Start building your guest list</p>
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Add first guest
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <p className="text-sm text-stone-400">No guests match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">Side</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">RSVP</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((guest) => (
                  <tr key={guest.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-stone-900">{guest.name}</span>
                      {guest.notes && (
                        <p className="text-xs text-stone-400 mt-0.5 truncate max-w-48">{guest.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-500 hidden sm:table-cell">
                      {guest.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-stone-500 text-xs">{SIDE_LABELS[guest.side]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={RSVP_COLORS[guest.rsvp_status]}>
                        {guest.rsvp_status.charAt(0).toUpperCase() + guest.rsvp_status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { copyRSVPLink(guest.rsvp_token ?? ''); alert('RSVP link copied!') }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Copy RSVP link"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditGuest(guest)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest)}
                          disabled={deleting === guest.id}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length < guests.length && (
            <div className="px-4 py-2 border-t border-stone-100 bg-stone-50">
              <p className="text-xs text-stone-400">Showing {filtered.length} of {guests.length} guests</p>
            </div>
          )}
        </div>
      )}

      <GuestImport open={importOpen} onClose={() => setImportOpen(false)} weddingId={weddingId} />
      <GuestForm open={addOpen} onClose={() => setAddOpen(false)} weddingId={weddingId} />
      {editGuest && (
        <GuestForm
          open={Boolean(editGuest)}
          onClose={() => setEditGuest(null)}
          weddingId={weddingId}
          guest={editGuest}
        />
      )}
    </>
  )
}
