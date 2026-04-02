'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createEvent(weddingId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('events').insert({
    wedding_id: weddingId,
    type: formData.get('type') as string,
    name: formData.get('name') as string,
    date: (formData.get('date') as string) || null,
    time: (formData.get('time') as string) || null,
    venue: (formData.get('venue') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/events')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .update({
      type: formData.get('type') as string,
      name: formData.get('name') as string,
      date: (formData.get('date') as string) || null,
      time: (formData.get('time') as string) || null,
      venue: (formData.get('venue') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/events')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/events')
  revalidatePath('/dashboard')
  return { success: true }
}
