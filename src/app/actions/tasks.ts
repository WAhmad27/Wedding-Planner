'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createTask(weddingId: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').insert({
    wedding_id: weddingId,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    category: (formData.get('category') as string) || 'other',
    due_date: (formData.get('due_date') as string) || null,
    completed: false,
  })
  if (error) return { error: error.message }
  revalidatePath('/checklist')
  return { success: true }
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      category: formData.get('category') as string,
      due_date: (formData.get('due_date') as string) || null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/checklist')
  return { success: true }
}

export async function toggleTask(id: string, completed: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/checklist')
  return { success: true }
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/checklist')
  return { success: true }
}
