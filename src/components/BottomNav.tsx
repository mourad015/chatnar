'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, isActive } from './Sidebar'

// Phone-only tab bar.
export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-brand-black/95 backdrop-blur border-t border-brand-border grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            className={cn('flex flex-col items-center justify-center gap-1 text-[10px] font-bold', active ? 'text-brand-orange' : 'text-brand-muted')}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
