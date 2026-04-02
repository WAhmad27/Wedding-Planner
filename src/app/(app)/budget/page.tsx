import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BudgetClient } from './BudgetClient'

export default async function BudgetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!wedding) redirect('/dashboard')

  const [budgetResult, expensesResult] = await Promise.all([
    supabase.from('budget').select('*').eq('wedding_id', wedding.id).single(),
    supabase.from('expenses').select('*').eq('wedding_id', wedding.id).order('created_at', { ascending: false }),
  ])

  return (
    <div className="max-w-3xl">
      <BudgetClient
        weddingId={wedding.id}
        budget={budgetResult.data}
        expenses={expensesResult.data ?? []}
      />
    </div>
  )
}
