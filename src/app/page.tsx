import Link from 'next/link'
import { ArrowRight, Eye, Gift, Target, Tv2 } from 'lucide-react'
import PredictionCard from '@/components/PredictionCard'
import StreamCard from '@/components/StreamCard'
import { Avatar, LiveBadge, SectionTitle, Thumbnail } from '@/components/ui'
import {
  CATEGORIES, LEADERBOARD, STREAMERS,
  formatCoins, formatCount, getCategory, openPredictions,
} from '@/lib/data'

const STEPS = [
  { icon: Tv2,    title: 'Watch',   text: 'Pick a Tunisian streamer who is live right now.' },
  { icon: Target, title: 'Predict', text: 'Call what happens next with your free coins.' },
  { icon: Gift,   title: 'Win',     text: 'Climb the leaderboard and grab sponsor prizes.' },
]

export default function Home() {
  const live = STREAMERS.filter(s => s.live).sort((a, b) => b.viewers - a.viewers)
  const featured = live[0]
  const featuredPrediction = openPredictions().find(p => p.streamer === featured.slug)
  const hot = openPredictions()
    .filter(p => p.id !== featuredPrediction?.id)
    .sort((a, b) => a.secondsLeft - b.secondsLeft)
  const totalViewers = live.reduce((n, s) => n + s.viewers, 0)

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col gap-10">

      {/* Hero: featured stream + its live prediction */}
      <section className="relative">
        <div className="mb-4">
          <div className="text-sm font-semibold text-brand-muted">
            Ahla 👋 <span className="text-white">{formatCount(totalViewers)}</span> people are watching right now
          </div>
          <h1 className="font-display text-4xl sm:text-5xl leading-none mt-1">
            <span className="text-white">THE CHAT IS </span>
            <span className="text-brand-orange">ON FIRE</span>
            <span className="text-white"> TONIGHT</span>
          </h1>
        </div>

        <div className="grid gap-4 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_360px]">
          <Link href={`/stream/${featured.slug}`} className="group relative block min-w-0">
            <Thumbnail streamer={featured} big className="border border-brand-border group-hover:border-brand-orange transition-colors" />
            <div className="pt-3 sm:pt-0 sm:absolute sm:inset-x-0 sm:bottom-0 sm:p-6 flex items-end justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={featured.name} hue={featured.hue} size={48} live />
                <div className="min-w-0">
                  <div className="hidden sm:flex items-center gap-2 mb-0.5">
                    <LiveBadge />
                    <span className="text-xs text-white/80 font-semibold inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {formatCount(featured.viewers)} watching
                    </span>
                  </div>
                  <div className="font-bold text-white text-lg leading-tight truncate">{featured.title}</div>
                  <div className="text-sm text-white/70">{featured.name} · {getCategory(featured.category)?.label}</div>
                </div>
              </div>
              <span className="hidden sm:inline-flex btn-orange px-4 py-2 text-sm items-center gap-1 shrink-0">
                Watch & predict <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {featuredPrediction && (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] font-extrabold tracking-[0.2em] text-brand-orange uppercase">Happening now</div>
              <PredictionCard prediction={featuredPrediction} className="border-brand-orange/40" />
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="-mx-4 px-4 flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(c => (
          <Link key={c.id} href={`/streams?c=${c.id}`} className="tn-tag whitespace-nowrap">
            {c.emoji} {c.label}
          </Link>
        ))}
      </section>

      {/* Hot predictions */}
      <section>
        <SectionTitle
          kicker="Closing soon"
          title="HOT PREDICTIONS"
          action={<Link href="/predictions" className="text-sm font-semibold text-brand-muted hover:text-brand-orange inline-flex items-center gap-1">See all <ArrowRight className="w-4 h-4" /></Link>}
        />
        <div className="-mx-4 px-4 flex gap-3 overflow-x-auto no-scrollbar snap-x pb-1">
          {hot.map(p => (
            <PredictionCard key={p.id} prediction={p} className="w-[290px] shrink-0 snap-start" />
          ))}
        </div>
      </section>

      {/* Live now */}
      <section>
        <SectionTitle
          kicker="Live in Tunisia"
          title="WHO'S ON"
          action={<Link href="/streams" className="text-sm font-semibold text-brand-muted hover:text-brand-orange inline-flex items-center gap-1">Browse <ArrowRight className="w-4 h-4" /></Link>}
        />
        <div className="grid gap-x-3 sm:gap-x-4 gap-y-5 sm:gap-y-6 grid-cols-2 xl:grid-cols-4">
          {live.slice(1).map(s => <StreamCard key={s.slug} streamer={s} />)}
        </div>
      </section>

      {/* How it works + top predictors */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="chatnar-card p-5 relative overflow-hidden">
          <div className="absolute inset-0 tn-pattern opacity-[0.04]" />
          <div className="relative">
            <SectionTitle kicker="New here?" title="HOW IT WORKS" />
            <div className="grid gap-3 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="rounded-card bg-white/[0.03] border border-brand-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full bg-orange-gradient flex items-center justify-center text-xs font-extrabold">{i + 1}</span>
                    <s.icon className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div className="font-display text-xl text-white">{s.title.toUpperCase()}</div>
                  <div className="text-xs text-brand-muted mt-1">{s.text}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-muted mt-4">Coins are free. No real money, ever — just bragging rights and prizes.</p>
          </div>
        </div>

        <div className="chatnar-card p-5">
          <SectionTitle
            kicker="This week"
            title="TOP PREDICTORS"
            action={<Link href="/leaderboard" className="text-sm font-semibold text-brand-muted hover:text-brand-orange inline-flex items-center gap-1">Full board <ArrowRight className="w-4 h-4" /></Link>}
          />
          <ol className="flex flex-col">
            {LEADERBOARD.slice(0, 5).map((u, i) => (
              <li key={u.name} className="flex items-center gap-3 py-2 border-b border-brand-border last:border-0">
                <span className={`w-6 text-center font-display text-xl ${i === 0 ? 'text-brand-gold' : 'text-brand-muted'}`}>{i + 1}</span>
                <Avatar name={u.name} hue={u.hue} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white truncate">{u.name}</div>
                  <div className="text-[11px] text-brand-muted">{u.city} · {u.accuracy}% right{u.streak >= 3 ? ` · 🔥${u.streak}` : ''}</div>
                </div>
                <span className="text-sm font-bold text-brand-gold tabular-nums">🪙 {formatCoins(u.coins)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
