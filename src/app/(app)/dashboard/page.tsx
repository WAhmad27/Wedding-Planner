import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, Users, CheckCircle, Clock, Wallet, Handshake, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { WeddingSetupForm } from '@/components/WeddingSetupForm'
import { Countdown } from '@/components/Countdown'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatPKR, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!wedding) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-stone-900 mb-6">Dashboard</h1>
        <WeddingSetupForm />
      </div>
    )
  }

  const [eventsResult, guestsResult, budgetResult, expensesResult, vendorsResult, tasksResult] = await Promise.all([
    supabase.from('events').select('*').eq('wedding_id', wedding.id).order('date', { ascending: true }),
    supabase.from('guests').select('*').eq('wedding_id', wedding.id),
    supabase.from('budget').select('*').eq('wedding_id', wedding.id).single(),
    supabase.from('expenses').select('amount, paid').eq('wedding_id', wedding.id),
    supabase.from('vendors').select('status').eq('wedding_id', wedding.id),
    supabase.from('tasks').select('*').eq('wedding_id', wedding.id).order('due_date', { ascending: true, nullsFirst: false }),
  ])

  const events = eventsResult.data ?? []
  const guests = guestsResult.data ?? []
  const expenses = expensesResult.data ?? []
  const vendors = vendorsResult.data ?? []
  const tasks = tasksResult.data ?? []

  const confirmed = guests.filter((g) => g.rsvp_status === 'confirmed').length
  const pending = guests.filter((g) => g.rsvp_status === 'pending').length
  const declined = guests.filter((g) => g.rsvp_status === 'declined').length

  const totalBudget = budgetResult.data?.total_budget ?? 0
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const remaining = totalBudget - totalSpent
  const bookedVendors = vendors.filter((v) => v.status === 'booked').length
  const tasksDone = tasks.filter((t) => t.completed).length
  const tasksTotal = tasks.length
  const tasksPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0
  const overdueTasks = tasks.filter((t) => !t.completed && t.due_date && new Date(t.due_date) < new Date())
  const upcomingTasks = tasks.filter((t) => !t.completed).slice(0, 3)

  const upcomingEvents = events
    .filter((e) => e.date && new Date(e.date) >= new Date())
    .slice(0, 3)

  const stats = [
    { label: 'Events', value: events.length, icon: CalendarDays, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Total Guests', value: guests.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Confirmed', value: confirmed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending RSVPs', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Budget Spent', value: formatPKR(totalSpent), icon: Wallet, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Vendors Booked', value: `${bookedVendors}/${vendors.length}`, icon: Handshake, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-stone-900">{wedding.title}</h1>
        {wedding.wedding_date && (
          <p className="text-sm text-stone-500 mt-0.5">{formatDate(wedding.wedding_date)}</p>
        )}
      </div>

      {/* Countdown */}
      {wedding.wedding_date && (
        <Countdown weddingDate={wedding.wedding_date} weddingTitle={wedding.title} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">{label}</span>
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
            </div>
            <p className="text-xl font-semibold text-stone-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Budget bar */}
      {totalBudget > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-900">Budget Overview</h2>
            <Link href="/budget" className="text-xs text-rose-600 hover:text-rose-700 font-medium">
              Manage →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <p className="text-xs text-stone-400">Total</p>
              <p className="text-sm font-semibold text-stone-900">{formatPKR(totalBudget)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Spent</p>
              <p className="text-sm font-semibold text-rose-600">{formatPKR(totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Remaining</p>
              <p className={`text-sm font-semibold ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatPKR(remaining)}
              </p>
            </div>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${totalSpent / totalBudget >= 1 ? 'bg-red-500' : totalSpent / totalBudget >= 0.8 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* RSVP bar */}
      {guests.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-900">RSVP Overview</h2>
            <Link href="/guests" className="text-xs text-rose-600 hover:text-rose-700 font-medium">
              Manage →
            </Link>
          </div>
          <div className="flex rounded-full overflow-hidden h-3">
            {confirmed > 0 && (
              <div className="bg-emerald-500" style={{ width: `${(confirmed / guests.length) * 100}%` }} />
            )}
            {pending > 0 && (
              <div className="bg-amber-400" style={{ width: `${(pending / guests.length) * 100}%` }} />
            )}
            {declined > 0 && (
              <div className="bg-stone-300" style={{ width: `${(declined / guests.length) * 100}%` }} />
            )}
          </div>
          <div className="flex gap-4 mt-3">
            {[
              { label: 'Confirmed', count: confirmed, color: 'bg-emerald-500' },
              { label: 'Pending', count: pending, color: 'bg-amber-400' },
              { label: 'Declined', count: declined, color: 'bg-stone-300' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-stone-500">{label} ({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist summary */}
      {tasksTotal > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-900">Checklist</h2>
            <Link href="/checklist" className="text-xs text-rose-600 hover:text-rose-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span>{tasksDone} of {tasksTotal} tasks done</span>
            <span className="font-medium text-stone-700">{tasksPct}%</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${tasksPct}%` }}
            />
          </div>
          {overdueTasks.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-red-50 border border-red-100 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="text-xs text-red-600 font-medium">
                {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {upcomingTasks.length > 0 && (
            <div className="space-y-1.5">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0" />
                  <span className="text-xs text-stone-600 truncate">{task.title}</span>
                  {task.due_date && (
                    <span className="text-xs text-stone-400 ml-auto shrink-0">{formatDate(task.due_date)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-900">Upcoming Events</h2>
          <Link href="/events" className="text-xs text-rose-600 hover:text-rose-700 font-medium">
            View all →
          </Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
            <p className="text-sm text-stone-400">No upcoming events yet.</p>
            <Link href="/events" className="mt-2 inline-block text-sm text-rose-600 hover:text-rose-700 font-medium">
              Add your first event →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-stone-200 px-4 py-3 flex items-center gap-3">
                <Badge className={EVENT_TYPE_COLORS[event.type]}>
                  {EVENT_TYPE_LABELS[event.type]}
                </Badge>
                <span className="text-sm font-medium text-stone-900 flex-1">{event.name}</span>
                {event.date && (
                  <span className="text-xs text-stone-400">{formatDate(event.date)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
