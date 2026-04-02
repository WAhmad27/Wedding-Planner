'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, Users, Wallet,
  Handshake, CheckSquare, FileText, Settings, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions/auth'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/guests', label: 'Guests', icon: Users },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/vendors', label: 'Vendors', icon: Handshake },
  { href: '/checklist', label: 'Checklist', icon: CheckSquare },
  { href: '/notes', label: 'Notes', icon: FileText },
]

interface SidebarProps {
  userName: string
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col bg-white border-r border-stone-200 min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">💍</span>
          <div>
            <p className="text-sm font-semibold text-stone-900 leading-tight">Wedding Planner</p>
            <p className="text-xs text-stone-400">Pakistan</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-rose-50 text-rose-700'
                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-stone-100 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-rose-50 text-rose-700'
              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </Link>
        <div className="px-3 py-1">
          <p className="text-xs text-stone-400 truncate">{userName}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
