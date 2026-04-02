'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createGuest(weddingId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('guests').insert({
    wedding_id: weddingId,
    name: formData.get('name') as string,
    phone: (formData.get('phone') as string) || null,
    email: (formData.get('email') as string) || null,
    side: (formData.get('side') as string) || 'mutual',
    rsvp_status: (formData.get('rsvp_status') as string) || 'pending',
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/guests')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateGuest(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('guests')
    .update({
      name: formData.get('name') as string,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
      side: formData.get('side') as string,
      rsvp_status: formData.get('rsvp_status') as string,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/guests')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteGuest(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('guests').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/guests')
  revalidatePath('/dashboard')
  return { success: true }
}
