'use client'

import Link from 'next/link'
import { Home, Tv2, Zap, Film, Trophy, Coins, Crown, Activity, Users } from 'lucide-react'

const navItems = [
  { href: '/',              icon: Home,     label: 'Home' },
  { href: '/streams',       icon: Tv2,      label: 'Browse' },
  { href: '/predictions',   icon: Zap,      label: 'Live Predictions' },
  { href: '/clips',         icon: Film,     label: 'Clips' },
  { href: '/leaderboard',   icon: Trophy,   label: 'Leaderboards' },
  { href: '/coins',         icon: Coins,    label: 'Coins Shop' },
  { href: '/vip',           icon: Crown,    label: 'VIP' },
  { href: '/activity',      icon: Activity, label: 'My Activity' },
  { href: '/following',     icon: Users,    label: 'Following' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-40 bg-brand-sidebar border-r border-brand-border hidden md:flex flex-col overflow-y-auto z-40">

      {/* Nav links */}
      <nav className="flex flex-col py-4 gap-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-2.5 text-brand-muted hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-brand-border mx-4 my-2" />

      {/* Daily Chest */}
      <div className="mx-3 my-3 p-3 chatnar-card text-center">
        <div className="text-xs text-brand-muted uppercase tracking-wider font-bold mb-1">Daily Chest</div>
        <div className="text-2xl my-2">🎁</div>
        <div className="text-xs text-brand-muted mb-2">Ready to claim!</div>
        <button className="btn-orange w-full text-xs py-1.5 font-bold">
          CLAIM 🪙 100
        </button>
      </div>

      {/* Predict banner */}
      <div className="mx-3 mb-3 p-3 rounded-card border border-brand-border bg-gradient-to-b from-brand-card to-black text-center">
        <div className="font-display text-brand-orange text-lg leading-tight">PREDICT.</div>
        <div className="font-display text-white text-lg leading-tight">WIN COINS.</div>
        <div className="font-display text-brand-orange text-lg leading-tight">BE LEGEND.</div>
        <div className="text-2xl my-2">🪙</div>
        <button className="btn-orange w-full text-xs py-1.5 font-bold mt-1">
          START PREDICTING
        </button>
      </div>

      {/* Footer */}
      <div className="mt-auto px-4 pb-4">
        <div className="text-xs text-brand-muted font-bold mb-2">FI TUNIS</div>
        <div className="flex gap-2 text-brand-muted">
          <span className="cursor-pointer hover:text-brand-orange transition-colors text-xs">𝕏</span>
          <span className="cursor-pointer hover:text-brand-orange transition-colors text-xs">TK</span>
          <span className="cursor-pointer hover:text-brand-orange transition-colors text-xs">IG</span>
          <span className="cursor-pointer hover:text-brand-orange transition-colors text-xs">YT</span>
        </div>
        <div className="text-xs text-brand-muted mt-2">© 2024 ChatNar.</div>
      </div>
    </aside>
  )
}