'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Tv2, Zap, Trophy, Crown, Film, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STREAMERS, formatCount, getCategory } from '@/lib/data'
import { useCoins } from './CoinsProvider'
import { Avatar } from './ui'

export const NAV_ITEMS = [
  { href: '/',            icon: Home,   label: 'Home' },
  { href: '/streams',     icon: Tv2,    label: 'Browse' },
  { href: '/predictions', icon: Zap,    label: 'Predictions' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/vip',         icon: Crown,  label: 'VIP' },
]

const SOON = [
  { icon: Film,  label: 'Clips' },
  { icon: Users, label: 'Following' },
]

export function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export default function Sidebar() {
  const pathname = usePathname()
  const { chestReady, claimChest } = useCoins()
  const live = [...STREAMERS].filter(s => s.live).sort((a, b) => b.viewers - a.viewers).slice(0, 6)

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-56 bg-brand-sidebar border-r border-brand-border hidden md:flex flex-col overflow-y-auto no-scrollbar z-40">

      <nav className="flex flex-col py-3 gap-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all border-l-[3px]',
              isActive(pathname, href)
                ? 'text-brand-orange border-brand-orange bg-brand-orange/[0.08]'
                : 'text-brand-muted border-transparent hover:text-white hover:bg-white/5',
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
        {SOON.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-brand-muted/50 border-l-[3px] border-transparent cursor-default">
            <Icon className="w-4 h-4 shrink-0" />
            {label}
            <span className="ml-auto text-[9px] font-extrabold border border-brand-border rounded px-1.5 py-0.5">SOON</span>
          </div>
        ))}
      </nav>

      <div className="border-t border-brand-border mx-4" />

      {/* Live channels */}
      <div className="py-3">
        <div className="px-4 mb-2 text-[11px] font-extrabold tracking-[0.15em] text-brand-muted uppercase">Live now</div>
        {live.map(s => (
          <Link key={s.slug} href={`/stream/${s.slug}`} className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-white/5 group">
            <Avatar name={s.name} hue={s.hue} size={28} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">{s.name}</div>
              <div className="text-[11px] text-brand-muted truncate">{getCategory(s.category)?.label}</div>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-brand-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
              {formatCount(s.viewers)}
            </span>
          </Link>
        ))}
      </div>

      {/* Daily Chest */}
      <div className="mx-3 mt-auto mb-3 p-3 chatnar-card text-center relative overflow-hidden">
        <div className="absolute inset-0 tn-pattern opacity-[0.05]" />
        <div className="relative">
          <div className="text-[11px] text-brand-muted uppercase tracking-wider font-extrabold">Daily Chest</div>
          <div className={cn('text-3xl my-1.5', chestReady && 'animate-bounce')}>🎁</div>
          <button
            onClick={claimChest}
            disabled={!chestReady}
            className={cn('w-full text-xs py-1.5 font-bold rounded-md', chestReady ? 'btn-orange' : 'bg-white/5 text-brand-muted cursor-default')}
          >
            {chestReady ? 'CLAIM 🪙 100' : 'Come back tomorrow'}
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 text-[11px] text-brand-muted">
        Made with 🌶️ in Tunisia · © {new Date().getFullYear()} ChatNar
      </div>
    </aside>
  )
}
