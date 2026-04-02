'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createNote(weddingId: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('notes').insert({
    wedding_id: weddingId,
    event_id: (formData.get('event_id') as string) || null,
    title: formData.get('title') as string,
    content: (formData.get('content') as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/notes')
  return { success: true }
}

export async function updateNote(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notes')
    .update({
      event_id: (formData.get('event_id') as string) || null,
      title: formData.get('title') as string,
      content: (formData.get('content') as string) || null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/notes')
  return { success: true }
}

export async function deleteNote(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/notes')
  return { success: true }
}
