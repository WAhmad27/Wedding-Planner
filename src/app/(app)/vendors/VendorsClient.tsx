'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { VendorForm } from '@/components/vendors/VendorForm'
import { deleteVendor } from '@/app/actions/vendors'
import { formatPKR, CATEGORY_LABELS, CATEGORY_COLORS, VENDOR_STATUS_COLORS } from '@/lib/utils'
import type { Vendor, VendorType } from '@/types'

interface VendorsClientProps {
  vendors: Vendor[]
  weddingId: string
}

export function VendorsClient({ vendors, weddingId }: VendorsClientProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editVendor, setEditVendor] = useState<Vendor | null>(null)
  const [typeFilter, setTypeFilter] = useState<VendorType | 'all'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = typeFilter === 'all' ? vendors : vendors.filter((v) => v.type === typeFilter)

  const totalCost = vendors.reduce((sum, v) => sum + (Number(v.total_cost) || 0), 0)
  const totalPaid = vendors.reduce((sum, v) => sum + Number(v.amount_paid), 0)
  const booked = vendors.filter((v) => v.status === 'booked').length

  async function handleDelete(vendor: Vendor) {
    if (!confirm(`Remove "${vendor.name}"?`)) return
    setDeleting(vendor.id)
    await deleteVendor(vendor.id)
    setDeleting(null)
  }

  const selectClass =
    'px-3 py-2 rounded-lg border border-stone-300 text-stone-700 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500'

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Vendors</h1>
          <p className="text-sm text-stone-500 mt-0.5">{vendors.length} vendor{vendors.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add vendor
        </button>
      </div>

      {/* Stats */}
      {vendors.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Total Cost', value: formatPKR(totalCost), color: 'text-stone-900' },
            { label: 'Amount Paid', value: formatPKR(totalPaid), color: 'text-emerald-600' },
            { label: 'Booked', value: `${booked} / ${vendors.length}`, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs text-stone-400 mb-0.5">{label}</p>
              <p className={`text-base font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      {vendors.length > 0 && (
        <div className="mb-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as VendorType | 'all')}
            className={selectClass}
          >
            <option value="all">All types</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      )}

      {vendors.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <div className="text-4xl mb-3">🤝</div>
          <p className="text-sm font-medium text-stone-900 mb-1">No vendors yet</p>
          <p className="text-sm text-stone-400 mb-4">Track caterers, photographers, decorators and more</p>
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Add first vendor
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <p className="text-sm text-stone-400">No vendors match the selected type.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((vendor) => {
            const remaining = (Number(vendor.total_cost) || 0) - Number(vendor.amount_paid)
            const paidPct = vendor.total_cost
              ? Math.min((Number(vendor.amount_paid) / Number(vendor.total_cost)) * 100, 100)
              : 0

            return (
              <div key={vendor.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={CATEGORY_COLORS[vendor.type]}>
                      {CATEGORY_LABELS[vendor.type]}
                    </Badge>
                    <Badge className={VENDOR_STATUS_COLORS[vendor.status]}>
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditVendor(vendor)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor)}
                      disabled={deleting === vendor.id}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-stone-900 text-sm mb-1">{vendor.name}</h3>
                {vendor.service_description && (
                  <p className="text-xs text-stone-500 mb-3">{vendor.service_description}</p>
                )}

                {/* Contact */}
                <div className="space-y-1 mb-3">
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`} className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-600 transition-colors">
                      <Phone className="w-3 h-3" /> {vendor.phone}
                    </a>
                  )}
                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-600 transition-colors">
                      <Mail className="w-3 h-3" /> {vendor.email}
                    </a>
                  )}
                </div>

                {/* Payment */}
                {vendor.total_cost != null && (
                  <div className="pt-3 border-t border-stone-100">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-stone-400">Payment</span>
                      <span className="text-stone-600 font-medium">
                        {formatPKR(Number(vendor.amount_paid))} / {formatPKR(Number(vendor.total_cost))}
                      </span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                    {remaining > 0 && (
                      <p className="text-xs text-amber-600 mt-1">{formatPKR(remaining)} remaining</p>
                    )}
                  </div>
                )}

                {vendor.notes && (
                  <p className="text-xs text-stone-400 mt-3 pt-3 border-t border-stone-100">{vendor.notes}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <VendorForm open={addOpen} onClose={() => setAddOpen(false)} weddingId={weddingId} />
      {editVendor && (
        <VendorForm
          open={Boolean(editVendor)}
          onClose={() => setEditVendor(null)}
          weddingId={weddingId}
          vendor={editVendor}
        />
      )}
    </>
  )
}
