import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWeddingForUser } from '@/lib/getWedding'
import { ChecklistClient } from './ChecklistClient'

export default async function ChecklistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const wedding = await getWeddingForUser(supabase, user.id)
  if (!wedding) redirect('/dashboard')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl">
      <ChecklistClient tasks={tasks ?? []} weddingId={wedding.id} />
    </div>
  )
}
