'use client'

import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle, FileDown } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import type { GuestSide, RSVPStatus } from '@/types'

interface ImportRow {
  name: string
  phone: string
  email: string
  side: GuestSide
  rsvp_status: RSVPStatus
  notes: string
  valid: boolean
  error?: string
}

interface GuestImportProps {
  open: boolean
  onClose: () => void
  weddingId: string
}

const SIDE_MAP: Record<string, GuestSide> = {
  bride: 'bride', "bride's": 'bride', "bride's side": 'bride',
  groom: 'groom', "groom's": 'groom', "groom's side": 'groom',
  mutual: 'mutual', both: 'mutual', common: 'mutual',
}

const RSVP_MAP: Record<string, RSVPStatus> = {
  confirmed: 'confirmed', yes: 'confirmed', attending: 'confirmed', confirm: 'confirmed',
  declined: 'declined', no: 'declined', 'not attending': 'declined', decline: 'declined',
  pending: 'pending', maybe: 'pending', '': 'pending',
}

function normalise(val: unknown): string {
  return String(val ?? '').trim()
}

function parseRows(rawRows: Record<string, unknown>[]): ImportRow[] {
  return rawRows.map((row) => {
    const keys = Object.keys(row).map((k) => k.toLowerCase().trim())
    const get = (candidates: string[]) => {
      for (const c of candidates) {
        const key = keys.find((k) => k === c || k.includes(c))
        if (key) return normalise(row[Object.keys(row)[keys.indexOf(key)]])
      }
      return ''
    }

    const name = get(['name', 'full name', 'guest name', 'guest'])
    const phone = get(['phone', 'mobile', 'contact', 'phone number', 'cell'])
    const email = get(['email', 'e-mail', 'mail'])
    const sideRaw = get(['side', 'family', 'family side', 'group']).toLowerCase()
    const rsvpRaw = get(['rsvp', 'rsvp status', 'status', 'response', 'attending']).toLowerCase()
    const notes = get(['notes', 'note', 'remarks', 'comments'])

    const side: GuestSide = SIDE_MAP[sideRaw] ?? 'mutual'
    const rsvp_status: RSVPStatus = RSVP_MAP[rsvpRaw] ?? 'pending'

    if (!name) return { name, phone, email, side, rsvp_status, notes, valid: false, error: 'Name is required' }
    return { name, phone, email, side, rsvp_status, notes, valid: true }
  }).filter((r) => r.name || r.phone) // skip fully empty rows
}

async function downloadTemplate() {
  const xlsxModule = await import('xlsx')
  const XLSX = xlsxModule.default ?? xlsxModule

  const headers = ['Name', 'Phone', 'Email', 'Side', 'RSVP Status', 'Notes']
  const examples = [
    ['Ahmed Khan', '+92 300 1234567', 'ahmed@example.com', 'Groom', 'Confirmed', 'Best man'],
    ['Sara Ali', '+92 321 7654321', 'sara@example.com', "Bride", 'Pending', ''],
    ['Bilal Hassan', '+92 333 1112222', '', 'Mutual', 'Confirmed', 'Vegetarian'],
    ['Nadia Hussain', '', 'nadia@example.com', "Groom", 'Declined', ''],
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples])

  // Column widths
  ws['!cols'] = [
    { wch: 22 }, // Name
    { wch: 18 }, // Phone
    { wch: 26 }, // Email
    { wch: 14 }, // Side
    { wch: 14 }, // RSVP Status
    { wch: 28 }, // Notes
  ]

  // Dropdown validation for Side (D column) and RSVP Status (E column)
  // Applies to rows 2–200
  ws['!dataValidations'] = [
    {
      sqref: 'D2:D200',
      type: 'list',
      formula1: '"Bride,Groom,Mutual"',
      showDropDown: false,
      showErrorMessage: true,
      error: 'Please choose Bride, Groom, or Mutual',
      errorTitle: 'Invalid value',
    },
    {
      sqref: 'E2:E200',
      type: 'list',
      formula1: '"Confirmed,Pending,Declined"',
      showDropDown: false,
      showErrorMessage: true,
      error: 'Please choose Confirmed, Pending, or Declined',
      errorTitle: 'Invalid value',
    },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Guests')

  // Instructions sheet
  const instrData = [
    ['Wedding Planner — Guest List Template'],
    [''],
    ['Instructions:'],
    ['• Fill in the "Guests" sheet with your guest details.'],
    ['• Name is required. All other fields are optional.'],
    ['• Side: use Bride, Groom, or Mutual'],
    ['• RSVP Status: use Confirmed, Pending, or Declined (defaults to Pending if blank)'],
    ['• Phone format: +92 300 1234567 (any format accepted)'],
    ['• Do not remove or rename the header row.'],
  ]
  const wsInstr = XLSX.utils.aoa_to_sheet(instrData)
  wsInstr['!cols'] = [{ wch: 60 }]
  XLSX.utils.book_append_sheet(wb, wsInstr, 'Instructions')

  XLSX.writeFile(wb, 'guest-list-template.xlsx')
}

export function GuestImport({ open, onClose, weddingId }: GuestImportProps) {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setDone(false)
    setImportError(null)

    const isCSV = file.name.endsWith('.csv')
    const buffer = await file.arrayBuffer()

    try {
      const xlsxModule = await import('xlsx')
  const XLSX = xlsxModule.default ?? xlsxModule
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, {
        defval: '',
        raw: false,
      })
      if (raw.length === 0) { setImportError('The file appears to be empty.'); return }
      setRows(parseRows(raw))
    } catch {
      setImportError(`Could not read the file. Please use .xlsx, .xls or .csv format.`)
    }
    // reset input so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = ''
    void isCSV // suppress unused warning
  }

  async function handleImport() {
    const valid = rows.filter((r) => r.valid)
    if (valid.length === 0) return
    setImporting(true)
    setImportError(null)
    const supabase = createClient()
    const { error } = await supabase.from('guests').insert(
      valid.map((r) => ({
        wedding_id: weddingId,
        name: r.name,
        phone: r.phone || null,
        email: r.email || null,
        side: r.side,
        rsvp_status: r.rsvp_status,
        notes: r.notes || null,
      }))
    )
    if (error) {
      setImportError(error.message)
    } else {
      setDone(true)
      // Reload page to show new guests
      setTimeout(() => { window.location.reload() }, 1200)
    }
    setImporting(false)
  }

  function reset() {
    setRows([])
    setFileName('')
    setDone(false)
    setImportError(null)
  }

  const valid = rows.filter((r) => r.valid)
  const invalid = rows.filter((r) => !r.valid)

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Import Guest List" className="max-w-2xl">
      {done ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="font-semibold text-stone-900">Successfully imported {valid.length} guests!</p>
          <p className="text-sm text-stone-400 mt-1">Refreshing page…</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Instructions */}
          <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-600">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-stone-800 mb-1">How to format your file</p>
                <p className="text-xs">Your spreadsheet should have columns: <strong>Name</strong> (required), Phone, Email, Side, RSVP Status, Notes.</p>
                <p className="text-xs mt-1 text-stone-400">Supports <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> files.</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium rounded-lg transition-colors text-xs whitespace-nowrap"
              >
                <FileDown className="w-3.5 h-3.5" />
                Download template
              </button>
            </div>
          </div>

          {/* Upload area */}
          {rows.length === 0 ? (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-rose-400 hover:bg-rose-50/30 transition-colors">
              <Upload className="w-7 h-7 text-stone-400 mb-2" />
              <span className="text-sm font-medium text-stone-600">Click to upload file</span>
              <span className="text-xs text-stone-400 mt-0.5">.xlsx, .xls, .csv</span>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
            </label>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-lg">
              <span className="text-sm text-stone-600 truncate">{fileName}</span>
              <button onClick={reset} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {importError && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{importError}</p>
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-sm font-medium text-stone-700">
                  Preview — {valid.length} valid row{valid.length !== 1 ? 's' : ''}
                  {invalid.length > 0 && <span className="text-red-500 ml-1">({invalid.length} will be skipped)</span>}
                </p>
              </div>
              <div className="border border-stone-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-stone-500">Name</th>
                      <th className="text-left px-3 py-2 font-medium text-stone-500 hidden sm:table-cell">Phone</th>
                      <th className="text-left px-3 py-2 font-medium text-stone-500">Side</th>
                      <th className="text-left px-3 py-2 font-medium text-stone-500">RSVP</th>
                      <th className="px-3 py-2 w-6" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {rows.map((row, i) => (
                      <tr key={i} className={row.valid ? '' : 'bg-red-50'}>
                        <td className="px-3 py-2 font-medium text-stone-800">{row.name || '—'}</td>
                        <td className="px-3 py-2 text-stone-500 hidden sm:table-cell">{row.phone || '—'}</td>
                        <td className="px-3 py-2 text-stone-500 capitalize">{row.side}</td>
                        <td className="px-3 py-2 text-stone-500 capitalize">{row.rsvp_status}</td>
                        <td className="px-3 py-2">
                          {!row.valid && (
                            <span title={row.error} className="text-red-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          {rows.length > 0 && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { reset(); onClose() }}
                className="flex-1 py-2.5 px-4 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || valid.length === 0}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {importing ? 'Importing…' : `Import ${valid.length} guest${valid.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
