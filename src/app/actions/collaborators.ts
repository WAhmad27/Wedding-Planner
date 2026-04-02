'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function inviteCollaborator(weddingId: string, formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string).toLowerCase().trim()
  const role = formData.get('role') as string

  // Check if this email is already a collaborator
  const { data: existing } = await supabase
    .from('collaborators')
    .select('id')
    .eq('wedding_id', weddingId)
    .eq('invited_email', email)
    .single()

  if (existing) return { error: 'This person is already invited.' }

  // Check if this email belongs to an existing user and auto-link
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  const { error } = await supabase.from('collaborators').insert({
    wedding_id: weddingId,
    invited_email: email,
    role,
    status: profile ? 'accepted' : 'pending',
    user_id: profile?.id ?? null,
  })

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function removeCollaborator(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('collaborators').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}
