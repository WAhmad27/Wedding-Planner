import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VendorsClient } from './VendorsClient'

export default async function VendorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!wedding) redirect('/dashboard')

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <VendorsClient vendors={vendors ?? []} weddingId={wedding.id} />
    </div>
  )
}
