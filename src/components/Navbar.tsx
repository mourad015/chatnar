'use client'

import Link from 'next/link'
import { Bell, Crown, Search } from 'lucide-react'
import { CURRENT_USER, formatCoins } from '@/lib/data'
import { useCoins } from './CoinsProvider'
import { Avatar } from './ui'

export default function Navbar() {
  const { coins } = useCoins()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-brand-black/90 backdrop-blur border-b border-brand-border flex items-center px-4 gap-4">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-orange-gradient rounded-full flex items-center justify-center text-sm shadow-orange">
          🔥
        </div>
        <span className="font-display text-2xl tracking-wide leading-none">
          <span className="text-white">CHAT</span>
          <span className="text-brand-orange">NAR</span>
        </span>
      </Link>

      {/* Search */}
      <div className="hidden sm:block flex-1 max-w-xl mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
        <input
          type="text"
          placeholder="Search streamers, games, predictions…"
          className="w-full bg-brand-card border border-brand-border rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-orange transition-colors"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
        <Link
          href="/vip"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-brand-gold border border-brand-gold/40 hover:border-brand-gold rounded-full px-3 py-1.5 transition-colors"
        >
          <Crown className="w-3.5 h-3.5" /> VIP
        </Link>

        <button aria-label="Notifications" className="relative text-brand-muted hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-orange" />
        </button>

        <div className="coin-display flex items-center gap-1.5 tabular-nums">
          <span>🪙</span>
          <span key={coins} className="animate-coin-drop">{formatCoins(coins)}</span>
        </div>

        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar name={CURRENT_USER} hue={20} size={32} />
          <span className="hidden lg:inline text-sm text-white font-medium">{CURRENT_USER}</span>
        </div>
      </div>
    </nav>
  )
}
