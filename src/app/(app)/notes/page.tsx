import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWeddingForUser } from '@/lib/getWedding'
import { NotesClient } from './NotesClient'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const wedding = await getWeddingForUser(supabase, user.id)
  if (!wedding) redirect('/dashboard')

  const [notesResult, eventsResult] = await Promise.all([
    supabase.from('notes').select('*').eq('wedding_id', wedding.id).order('updated_at', { ascending: false }),
    supabase.from('events').select('*').eq('wedding_id', wedding.id).order('date', { ascending: true }),
  ])

  return (
    <div className="max-w-5xl">
      <NotesClient
        notes={notesResult.data ?? []}
        events={eventsResult.data ?? []}
        weddingId={wedding.id}
      />
    </div>
  )
}
