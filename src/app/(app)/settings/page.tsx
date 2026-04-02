import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!wedding) redirect('/dashboard')

  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('invited_at', { ascending: false })

  return (
    <SettingsClient
      weddingId={wedding.id}
      collaborators={collaborators ?? []}
      isOwner={true}
    />
  )
}
