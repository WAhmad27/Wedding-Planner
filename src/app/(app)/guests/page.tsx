import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GuestsClient } from './GuestsClient'

export default async function GuestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!wedding) redirect('/dashboard')

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <GuestsClient guests={guests ?? []} weddingId={wedding.id} />
    </div>
  )
}
