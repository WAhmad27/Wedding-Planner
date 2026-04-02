import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventsClient } from './EventsClient'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!wedding) redirect('/dashboard')

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('date', { ascending: true, nullsFirst: false })

  return (
    <div className="max-w-5xl">
      <EventsClient events={events ?? []} weddingId={wedding.id} />
    </div>
  )
}
