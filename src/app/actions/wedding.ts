'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createWedding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('weddings').insert({
    owner_id: user.id,
    title: formData.get('title') as string,
    bride_name: (formData.get('bride_name') as string) || null,
    groom_name: (formData.get('groom_name') as string) || null,
    wedding_date: (formData.get('wedding_date') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateWedding(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('weddings')
    .update({
      title: formData.get('title') as string,
      bride_name: (formData.get('bride_name') as string) || null,
      groom_name: (formData.get('groom_name') as string) || null,
      wedding_date: (formData.get('wedding_date') as string) || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
