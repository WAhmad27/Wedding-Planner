'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Download } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ExpenseForm } from '@/components/budget/ExpenseForm'
import { upsertBudget, deleteExpense, toggleExpensePaid } from '@/app/actions/budget'
import { formatPKR, formatDate, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/utils'
import type { Budget, Expense } from '@/types'

function exportBudgetCSV(expenses: Expense[], totalBudget: number) {
  const headers = ['Category', 'Description', 'Vendor', 'Amount (PKR)', 'Paid', 'Date']
  const rows = expenses.map((e) => [
    e.category,
    e.description,
    e.vendor_name ?? '',
    String(e.amount),
    e.paid ? 'Yes' : 'No',
    e.expense_date ?? '',
  ])
  const totalRow = ['', 'TOTAL', '', String(expenses.reduce((s, e) => s + Number(e.amount), 0)), '', '']
  const budgetRow = ['', 'BUDGET', '', String(totalBudget), '', '']
  const csv = [headers, ...rows, [], budgetRow, totalRow]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'budget.csv'
  a.click()
  URL.revokeObjectURL(url)
}

interface BudgetClientProps {
  weddingId: string
  budget: Budget | null
  expenses: Expense[]
}

export function BudgetClient({ weddingId, budget, expenses }: BudgetClientProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(String(budget?.total_budget ?? ''))
  const [savingBudget, setSavingBudget] = useState(false)

  const totalBudget = budget?.total_budget ?? 0
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalPaid = expenses.filter((e) => e.paid).reduce((sum, e) => sum + Number(e.amount), 0)
  const totalUnpaid = totalSpent - totalPaid
  const remaining = totalBudget - totalSpent
  const spentPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  // Group by category
  const byCategory = expenses.reduce<Record<string, { total: number; count: number }>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = { total: 0, count: 0 }
    acc[e.category].total += Number(e.amount)
    acc[e.category].count++
    return acc
  }, {})

  async function saveBudget() {
    setSavingBudget(true)
    await upsertBudget(weddingId, parseFloat(budgetInput) || 0)
    setSavingBudget(false)
    setEditingBudget(false)
  }

  async function handleTogglePaid(expense: Expense) {
    await toggleExpensePaid(expense.id, !expense.paid)
  }

  async function handleDelete(id: string, description: string) {
    if (!confirm(`Delete "${description}"?`)) return
    await deleteExpense(id)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Budget</h1>
          <p className="text-sm text-stone-500 mt-0.5">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {expenses.length > 0 && (
            <button
              onClick={() => exportBudgetCSV(expenses, totalBudget)}
              className="flex items-center gap-2 px-3 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add expense
          </button>
        </div>
      </div>

      {/* Budget overview */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-stone-900">Total Budget</h2>
          {!editingBudget ? (
            <button
              onClick={() => { setBudgetInput(String(budget?.total_budget ?? '')); setEditingBudget(true) }}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-36 px-2.5 py-1 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Budget in PKR"
                autoFocus
              />
              <button
                onClick={saveBudget}
                disabled={savingBudget}
                className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditingBudget(false)}
                className="p-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Budget', value: formatPKR(totalBudget), color: 'text-stone-900' },
            { label: 'Total Spent', value: formatPKR(totalSpent), color: 'text-rose-600' },
            { label: 'Paid', value: formatPKR(totalPaid), color: 'text-emerald-600' },
            { label: 'Remaining', value: formatPKR(remaining), color: remaining < 0 ? 'text-red-600' : 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-xs text-stone-400 mb-0.5">{label}</p>
              <p className={`text-base font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {totalBudget > 0 && (
          <div>
            <div className="flex justify-between text-xs text-stone-400 mb-1.5">
              <span>Spent</span>
              <span>{spentPct.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${spentPct >= 100 ? 'bg-red-500' : spentPct >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${spentPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Unpaid reminder */}
        {totalUnpaid > 0 && (
          <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 font-medium">
              {formatPKR(totalUnpaid)} still unpaid across {expenses.filter((e) => !e.paid).length} expense{expenses.filter((e) => !e.paid).length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-3">By Category</h2>
          <div className="space-y-2.5">
            {Object.entries(byCategory)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([cat, { total, count }]) => (
                <div key={cat} className="flex items-center gap-3">
                  <Badge className={CATEGORY_COLORS[cat]}>{CATEGORY_LABELS[cat]}</Badge>
                  <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-400 rounded-full"
                      style={{ width: totalSpent > 0 ? `${(total / totalSpent) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-stone-500 shrink-0">{formatPKR(total)} ({count})</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Expense list */}
      {expenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-sm font-medium text-stone-900 mb-1">No expenses yet</p>
          <p className="text-sm text-stone-400 mb-4">Start tracking your wedding costs</p>
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Add first expense
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
            <h2 className="text-sm font-semibold text-stone-900">All Expenses</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50/50 transition-colors">
                <button
                  onClick={() => handleTogglePaid(expense)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    expense.paid
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-stone-300 hover:border-emerald-400'
                  }`}
                  title={expense.paid ? 'Mark unpaid' : 'Mark paid'}
                >
                  {expense.paid && <Check className="w-3 h-3" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-stone-900">{expense.description}</span>
                    <Badge className={CATEGORY_COLORS[expense.category]}>
                      {CATEGORY_LABELS[expense.category]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {expense.vendor_name && (
                      <span className="text-xs text-stone-400">{expense.vendor_name}</span>
                    )}
                    {expense.expense_date && (
                      <span className="text-xs text-stone-400">{formatDate(expense.expense_date)}</span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-stone-900">{formatPKR(Number(expense.amount))}</p>
                  <p className={`text-xs ${expense.paid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {expense.paid ? 'Paid' : 'Unpaid'}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditExpense(expense)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id, expense.description)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ExpenseForm open={addOpen} onClose={() => setAddOpen(false)} weddingId={weddingId} />
      {editExpense && (
        <ExpenseForm
          open={Boolean(editExpense)}
          onClose={() => setEditExpense(null)}
          weddingId={weddingId}
          expense={editExpense}
        />
      )}
    </>
  )
}
