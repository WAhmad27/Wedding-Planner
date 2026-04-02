import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={profile?.full_name ?? user.email ?? 'User'} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
