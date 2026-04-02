'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createVendor(weddingId: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('vendors').insert({
    wedding_id: weddingId,
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    phone: (formData.get('phone') as string) || null,
    email: (formData.get('email') as string) || null,
    service_description: (formData.get('service_description') as string) || null,
    total_cost: parseFloat(formData.get('total_cost') as string) || null,
    amount_paid: parseFloat(formData.get('amount_paid') as string) || 0,
    status: (formData.get('status') as string) || 'pending',
    notes: (formData.get('notes') as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/vendors')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateVendor(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('vendors')
    .update({
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      phone: (formData.get('phone') as string) || null,
      email: (formData.get('email') as string) || null,
      service_description: (formData.get('service_description') as string) || null,
      total_cost: parseFloat(formData.get('total_cost') as string) || null,
      amount_paid: parseFloat(formData.get('amount_paid') as string) || 0,
      status: formData.get('status') as string,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/vendors')
  return { success: true }
}

export async function deleteVendor(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('vendors').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/vendors')
  revalidatePath('/dashboard')
  return { success: true }
}
