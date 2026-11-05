import type { Metadata } from 'next'
import { Avatar, SectionTitle } from '@/components/ui'
import { CURRENT_USER, LEADERBOARD, formatCoins } from '@/lib/data'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Leaderboard — ChatNar' }

const PODIUM = [
  { place: 2, height: 'h-24', ring: 'border-zinc-400',  medal: '🥈' },
  { place: 1, height: 'h-32', ring: 'border-brand-gold', medal: '🥇' },
  { place: 3, height: 'h-20', ring: 'border-amber-700', medal: '🥉' },
]

export default function LeaderboardPage() {
  const myRank = LEADERBOARD.findIndex(u => u.name === CURRENT_USER) + 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-8">
      <SectionTitle kicker="Resets every Monday" title="LEADERBOARD" />

      {/* Podium */}
      <section className="relative chatnar-card p-5 pt-8 overflow-hidden">
        <div className="absolute inset-0 tn-pattern opacity-[0.05]" />
        <div className="relative grid grid-cols-3 gap-3 items-end">
          {PODIUM.map(({ place, height, ring, medal }) => {
            const u = LEADERBOARD[place - 1]
            return (
              <div key={place} className="flex flex-col items-center gap-2 text-center min-w-0">
                <div className="text-2xl">{medal}</div>
                <div className={cn('rounded-full border-2 p-0.5', ring)}>
                  <Avatar name={u.name} hue={u.hue} size={place === 1 ? 64 : 52} />
                </div>
                <div className="text-sm font-bold text-white truncate w-full">{u.name}</div>
                <div className="text-xs font-bold text-brand-gold">🪙 {formatCoins(u.coins)}</div>
                <div className={cn('w-full rounded-t-md bg-gradient-to-b from-brand-orange/30 to-transparent border-t-2 border-brand-orange flex items-start justify-center pt-2 font-display text-3xl text-white/80', height)}>
                  {place}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Rest */}
      <section className="chatnar-card divide-y divide-brand-border">
        {LEADERBOARD.slice(3).map((u, i) => {
          const me = u.name === CURRENT_USER
          return (
            <div key={u.name} className={cn('flex items-center gap-3 px-4 py-3', me && 'bg-brand-orange/10')}>
              <span className="w-6 text-center font-display text-xl text-brand-muted">{i + 4}</span>
              <Avatar name={u.name} hue={u.hue} size={34} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate">
                  {u.name} {me && <span className="ml-1 text-[10px] font-extrabold bg-brand-orange text-white px-1.5 py-0.5 rounded">YOU</span>}
                </div>
                <div className="text-[11px] text-brand-muted">{u.city} · {u.accuracy}% right{u.streak >= 3 ? ` · 🔥 ${u.streak} streak` : ''}</div>
              </div>
              <span className="text-sm font-bold text-brand-gold tabular-nums">🪙 {formatCoins(u.coins)}</span>
            </div>
          )
        })}
      </section>

      {myRank > 0 && (
        <p className="text-sm text-brand-muted text-center">
          You&apos;re <span className="text-white font-bold">#{myRank}</span> this week. Every correct call moves you up. Yalla 💪
        </p>
      )}
    </div>
  )
}
