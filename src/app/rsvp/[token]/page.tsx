import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RSVPClient } from './RSVPClient'

export default async function RSVPPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('*')
    .eq('rsvp_token', token)
    .single()

  if (!guest) notFound()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', guest.wedding_id)
    .single()

  if (!wedding) notFound()

  return <RSVPClient guest={guest} wedding={wedding} />
}
