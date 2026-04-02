'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function upsertBudget(weddingId: string, totalBudget: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('budget')
    .upsert({ wedding_id: weddingId, total_budget: totalBudget }, { onConflict: 'wedding_id' })
  if (error) return { error: error.message }
  revalidatePath('/budget')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function createExpense(weddingId: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').insert({
    wedding_id: weddingId,
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    vendor_name: (formData.get('vendor_name') as string) || null,
    amount: parseFloat(formData.get('amount') as string) || 0,
    paid: formData.get('paid') === 'true',
    expense_date: (formData.get('expense_date') as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/budget')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('expenses')
    .update({
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      vendor_name: (formData.get('vendor_name') as string) || null,
      amount: parseFloat(formData.get('amount') as string) || 0,
      paid: formData.get('paid') === 'true',
      expense_date: (formData.get('expense_date') as string) || null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/budget')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/budget')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleExpensePaid(id: string, paid: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').update({ paid }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/budget')
  return { success: true }
}
