'use client'

import Link from 'next/link'
import { Bell, Search } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-brand-black border-b border-brand-border flex items-center px-4 gap-4">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-orange-gradient rounded-full flex items-center justify-center text-sm">
          🔥
        </div>
        <span className="font-bold text-lg">
          <span className="text-white">Chat</span>
          <span className="text-brand-orange">Nar</span>
        </span>
      </Link>

      {/* Search */}
      <div className="hidden sm:block flex-1 max-w-xl mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
        <input
          type="text"
          placeholder="Search streamers, predictions, moments..."
          className="w-full bg-brand-card border border-brand-border rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-orange transition-colors"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
        <button className="text-brand-muted hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* Coin balance */}
        <div className="coin-display flex items-center gap-1.5">
          <span>🪙</span>
          <span>12,450</span>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-xs font-bold text-white">
            S
          </div>
          <span className="hidden sm:inline text-sm text-white font-medium">Skander07</span>
        </div>
      </div>
    </nav>
  )
}