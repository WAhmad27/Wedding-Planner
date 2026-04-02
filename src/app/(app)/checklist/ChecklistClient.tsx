'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { TaskForm } from '@/components/tasks/TaskForm'
import { toggleTask, deleteTask } from '@/app/actions/tasks'
import { formatDate, TASK_CATEGORY_LABELS, TASK_CATEGORY_COLORS } from '@/lib/utils'
import type { Task, TaskCategory } from '@/types'

interface ChecklistClientProps {
  tasks: Task[]
  weddingId: string
}

export function ChecklistClient({ tasks, weddingId }: ChecklistClientProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all')
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all')

  const done = tasks.filter((t) => t.completed).length
  const total = tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchStatus = filter === 'all' || (filter === 'done' ? t.completed : !t.completed)
      const matchCat = categoryFilter === 'all' || t.category === categoryFilter
      return matchStatus && matchCat
    }).sort((a, b) => {
      // Incomplete first, then by due date
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
      if (a.due_date) return -1
      if (b.due_date) return 1
      return 0
    })
  }, [tasks, filter, categoryFilter])

  const overdue = tasks.filter(
    (t) => !t.completed && t.due_date && new Date(t.due_date) < new Date()
  ).length

  const selectClass = 'px-3 py-2 rounded-lg border border-stone-300 text-stone-700 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500'

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Checklist</h1>
          <p className="text-sm text-stone-500 mt-0.5">{done} of {total} tasks done</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add task
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-700">Overall progress</span>
            <span className="text-sm font-semibold text-stone-900">{pct}%</span>
          </div>
          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3">
            <span className="text-xs text-stone-500">{done} completed</span>
            <span className="text-xs text-stone-500">{total - done} remaining</span>
            {overdue > 0 && (
              <span className="text-xs text-red-600 font-medium">{overdue} overdue</span>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      {total > 0 && (
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex rounded-lg border border-stone-300 overflow-hidden text-sm">
            {(['all', 'pending', 'done'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 font-medium transition-colors capitalize ${filter === f ? 'bg-rose-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | 'all')} className={selectClass}>
            <option value="all">All categories</option>
            {Object.entries(TASK_CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      )}

      {total === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm font-medium text-stone-900 mb-1">No tasks yet</p>
          <p className="text-sm text-stone-400 mb-4">Start building your wedding to-do list</p>
          <button onClick={() => setAddOpen(true)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm">Add first task</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <p className="text-sm text-stone-400">No tasks match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const isOverdue = !task.completed && task.due_date && new Date(task.due_date) < new Date()
            return (
              <div key={task.id} className={`bg-white rounded-xl border px-4 py-3.5 flex items-start gap-3 transition-colors ${task.completed ? 'border-stone-100 opacity-60' : isOverdue ? 'border-red-200 bg-red-50/30' : 'border-stone-200'}`}>
                <button
                  onClick={() => toggleTask(task.id, !task.completed)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300 hover:border-emerald-400'}`}
                >
                  {task.completed && <Check className="w-3 h-3" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${task.completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                      {task.title}
                    </span>
                    <Badge className={TASK_CATEGORY_COLORS[task.category]}>
                      {TASK_CATEGORY_LABELS[task.category]}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-stone-400 mt-0.5">{task.description}</p>
                  )}
                  {task.due_date && (
                    <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-stone-400'}`}>
                      {isOverdue ? 'Overdue · ' : 'Due '}{formatDate(task.due_date)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditTask(task)} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { if (confirm(`Delete "${task.title}"?`)) deleteTask(task.id) }} className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <TaskForm open={addOpen} onClose={() => setAddOpen(false)} weddingId={weddingId} />
      {editTask && (
        <TaskForm open={Boolean(editTask)} onClose={() => setEditTask(null)} weddingId={weddingId} task={editTask} />
      )}
    </>
  )
}
