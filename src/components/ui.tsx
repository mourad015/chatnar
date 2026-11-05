import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCount, getCategory, type Streamer } from '@/lib/data'

export function Avatar({ name, hue, size = 32, live = false, className }: {
  name: string
  hue: number
  size?: number
  live?: boolean
  className?: string
}) {
  return (
    <div
      className={cn('relative shrink-0 rounded-full flex items-center justify-center font-bold text-white', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, hsl(${hue} 85% 55%), hsl(${(hue + 40) % 360} 85% 35%))`,
        boxShadow: live ? '0 0 0 2px #000, 0 0 0 4px #53FC18' : undefined,
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}

export function LiveBadge({ className }: { className?: string }) {
  return (
    <span className={cn('live-badge inline-flex items-center gap-1', className)}>
      <span className="live-dot w-1.5 h-1.5 rounded-full bg-black" />
      LIVE
    </span>
  )
}

export function ViewerPill({ viewers }: { viewers: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-black/70 backdrop-blur px-2 py-0.5 rounded">
      <Eye className="w-3 h-3" />
      {formatCount(viewers)}
    </span>
  )
}

// Stand-in for a stream thumbnail until we pull real ones from Kick.
export function Thumbnail({ streamer, className, big = false }: {
  streamer: Streamer
  className?: string
  big?: boolean
}) {
  const cat = getCategory(streamer.category)
  const h = streamer.hue
  return (
    <div
      className={cn('relative overflow-hidden rounded-card aspect-video', className)}
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, hsl(${h} 90% 45% / .9), transparent 60%),
                     radial-gradient(90% 90% at 90% 100%, hsl(${(h + 60) % 360} 90% 40% / .8), transparent 55%),
                     #0b0b0b`,
      }}
    >
      <div className="absolute inset-0 tn-pattern opacity-[0.08]" />
      <div className={cn('absolute inset-0 flex items-center justify-center select-none', big ? 'text-8xl' : 'text-5xl')}>
        <span className="drop-shadow-[0_6px_20px_rgba(0,0,0,.6)]">{cat?.emoji}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-card-gradient" />
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        {streamer.live && <LiveBadge />}
      </div>
      <div className="absolute bottom-2 left-2">
        <ViewerPill viewers={streamer.viewers} />
      </div>
    </div>
  )
}

export function SectionTitle({ kicker, title, action }: {
  kicker?: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div>
        {kicker && <div className="text-[11px] font-extrabold tracking-[0.2em] text-brand-orange uppercase">{kicker}</div>}
        <h2 className="font-display text-3xl leading-none text-white">{title}</h2>
      </div>
      {action}
    </div>
  )
}
