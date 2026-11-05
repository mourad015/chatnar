import Link from 'next/link'
import { Zap } from 'lucide-react'
import { getCategory, openPredictions, type Streamer } from '@/lib/data'
import { Avatar, Thumbnail } from './ui'

export default function StreamCard({ streamer }: { streamer: Streamer }) {
  const cat = getCategory(streamer.category)
  const live = openPredictions().filter(p => p.streamer === streamer.slug).length

  return (
    <Link href={`/stream/${streamer.slug}`} className="group flex flex-col gap-2.5">
      <div className="relative transition-transform duration-200 group-hover:-translate-y-1">
        <Thumbnail streamer={streamer} className="border border-brand-border group-hover:border-brand-orange group-hover:shadow-orange transition-all" />
        {live > 0 && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-extrabold bg-brand-orange text-white px-2 py-0.5 rounded">
            <Zap className="w-3 h-3" /> {live}<span className="hidden sm:inline"> LIVE PREDICTION{live > 1 ? 'S' : ''}</span>
          </span>
        )}
      </div>
      <div className="flex gap-2.5">
        <Avatar name={streamer.name} hue={streamer.hue} size={36} live={streamer.live} className="hidden sm:flex" />
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-bold text-white line-clamp-2 sm:truncate group-hover:text-brand-orange transition-colors">{streamer.title}</div>
          <div className="text-xs text-brand-muted truncate">{streamer.name} · {streamer.city}</div>
          <div className="mt-1 flex gap-1.5">
            <span className="text-[10px] font-semibold bg-white/5 border border-brand-border rounded-full px-2 py-0.5 text-brand-muted">
              {cat?.emoji} {cat?.label}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
