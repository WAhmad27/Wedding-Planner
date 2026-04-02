'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createTask, updateTask } from '@/app/actions/tasks'
import { TASK_CATEGORY_LABELS } from '@/lib/utils'
import type { Task } from '@/types'

const CATEGORIES = Object.entries(TASK_CATEGORY_LABELS)

interface TaskFormProps {
  open: boolean
  onClose: () => void
  weddingId: string
  task?: Task
}

export function TaskForm({ open, onClose, weddingId, task }: TaskFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(task)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = isEditing
      ? await updateTask(task!.id, formData)
      : await createTask(weddingId, formData)
    if (result?.error) { setError(result.error); setLoading(false) }
    else { onClose(); setLoading(false) }
  }

  const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm bg-white'
  const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5'

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Task' : 'Add Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Task</label>
          <input name="title" type="text" required defaultValue={task?.title ?? ''} className={inputClass} placeholder="e.g. Book the venue" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Category</label>
            <select name="category" defaultValue={task?.category ?? 'other'} className={inputClass}>
              {CATEGORIES.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Due date</label>
            <input name="due_date" type="date" defaultValue={task?.due_date ?? ''} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea name="description" rows={2} defaultValue={task?.description ?? ''} className={inputClass} placeholder="Any details…" />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-medium rounded-lg transition-colors text-sm">
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
