'use client'

import { useState } from 'react'
import { UserPlus, Trash2, Mail, Clock, CheckCircle } from 'lucide-react'
import { inviteCollaborator, removeCollaborator } from '@/app/actions/collaborators'
import type { Collaborator, CollaboratorRole } from '@/types'

const ROLE_LABELS: Record<CollaboratorRole, string> = {
  'co-planner': 'Co-planner',
  'vendor': 'Vendor',
  'view-only': 'View only',
}

const ROLE_DESCRIPTIONS: Record<CollaboratorRole, string> = {
  'co-planner': 'Full edit access — can manage guests, budget, events, tasks',
  'vendor': 'Limited access — can view their own vendor details',
  'view-only': 'Read-only access — can view everything but not edit',
}

interface SettingsClientProps {
  weddingId: string
  collaborators: Collaborator[]
  isOwner: boolean
}

export function SettingsClient({ weddingId, collaborators, isOwner }: SettingsClientProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<CollaboratorRole>('co-planner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    const formData = new FormData()
    formData.set('email', email)
    formData.set('role', role)
    const result = await inviteCollaborator(weddingId, formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(`Invitation sent to ${email}. They'll get access once they sign up or log in.`)
      setEmail('')
    }
    setLoading(false)
  }

  async function handleRemove(id: string, invEmail: string) {
    if (!confirm(`Remove ${invEmail} from your wedding?`)) return
    await removeCollaborator(id)
  }

  const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm bg-white'

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Settings</h1>
        <p className="text-sm text-stone-500 mt-0.5">Manage collaboration and access</p>
      </div>

      {/* Invite form — only for owner */}
      {isOwner && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Invite someone</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="family@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as CollaboratorRole)} className={inputClass}>
                {(Object.entries(ROLE_LABELS) as [CollaboratorRole, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-stone-400 mt-1.5">{ROLE_DESCRIPTIONS[role]}</p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Sending…' : 'Send invite'}
            </button>
          </form>
        </div>
      )}

      {/* Collaborator list */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">
          {collaborators.length === 0 ? 'No collaborators yet' : `Collaborators (${collaborators.length})`}
        </h2>
        {collaborators.length === 0 ? (
          <p className="text-sm text-stone-400">Invite family or friends to help plan your wedding.</p>
        ) : (
          <div className="space-y-3">
            {collaborators.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{c.invited_email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-400">{ROLE_LABELS[c.role]}</span>
                    <span className="text-stone-300">·</span>
                    {c.status === 'accepted' ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle className="w-3 h-3" /> Accepted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="w-3 h-3" /> Pending signup
                      </span>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemove(c.id, c.invited_email)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RSVP link info */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h2 className="text-sm font-semibold text-stone-900 mb-1">Guest RSVP links</h2>
        <p className="text-sm text-stone-500">
          Each guest has a unique RSVP link you can share with them. Find the link icon on the Guests page next to each guest&apos;s row.
        </p>
      </div>
    </div>
  )
}
