'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Users, Wallet, Handshake, CheckSquare, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/guests', label: 'Guests', icon: Users },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/checklist', label: 'Tasks', icon: CheckSquare },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/vendors', label: 'Vendors', icon: Handshake },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 z-40 overflow-x-auto">
      <div className="flex min-w-max px-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 py-3 px-3 text-xs font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'text-rose-600'
                : 'text-stone-400 hover:text-stone-600'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
