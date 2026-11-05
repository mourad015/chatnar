import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Eye, Heart, MapPin } from 'lucide-react'
import StreamPanel from '@/components/StreamPanel'
import StreamCard from '@/components/StreamCard'
import { Avatar, LiveBadge, SectionTitle, Thumbnail } from '@/components/ui'
import { STREAMERS, formatCount, getCategory, getStreamer, predictionsFor } from '@/lib/data'

export function generateStaticParams() {
  return STREAMERS.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const s = getStreamer(slug)
  return { title: s ? `${s.name} — ChatNar` : 'Stream — ChatNar' }
}

export default async function StreamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const streamer = getStreamer(slug)
  if (!streamer) notFound()

  const cat = getCategory(streamer.category)
  const more = STREAMERS.filter(s => s.live && s.slug !== slug && s.category === streamer.category)
  const others = (more.length ? more : STREAMERS.filter(s => s.live && s.slug !== slug)).slice(0, 4)

  return (
    <div className="max-w-[1400px] mx-auto px-0 sm:px-4 sm:py-4 flex flex-col gap-8">
      <div className="grid gap-4 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_380px] lg:h-[calc(100vh-5rem)]">

        {/* Player + info */}
        <div className="flex flex-col gap-4 min-h-0">
          {streamer.kick ? (
            <div className="relative aspect-video sm:rounded-card overflow-hidden border-y sm:border border-brand-border bg-black">
              <iframe
                src={`https://player.kick.com/${streamer.kick}`}
                title={`${streamer.name} on Kick`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <Thumbnail streamer={streamer} big className="sm:border border-brand-border !rounded-none sm:!rounded-card" />
          )}

          <div className="px-4 sm:px-0 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar name={streamer.name} hue={streamer.hue} size={52} live={streamer.live} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg text-white truncate">{streamer.name}</h1>
                  {streamer.live && <LiveBadge />}
                </div>
                <div className="text-sm text-white/80 truncate">{streamer.title}</div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted mt-1">
                  <Link href={`/streams?c=${streamer.category}`} className="hover:text-brand-orange">{cat?.emoji} {cat?.label}</Link>
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {streamer.city}</span>
                  <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {formatCount(streamer.viewers)} watching</span>
                  <span>{formatCount(streamer.followers)} followers</span>
                </div>
              </div>
            </div>
            <button className="btn-orange px-5 py-2 text-sm inline-flex items-center justify-center gap-1.5 shrink-0">
              <Heart className="w-4 h-4" /> Follow
            </button>
          </div>
        </div>

        {/* Predictions / chat / top */}
        <div className="px-4 sm:px-0 min-h-[420px] lg:min-h-0">
          <StreamPanel predictions={predictionsFor(streamer.slug)} />
        </div>
      </div>

      {others.length > 0 && (
        <section className="px-4 sm:px-0 pb-6">
          <SectionTitle kicker="Keep watching" title="MORE LIVE" />
          <div className="grid gap-x-3 sm:gap-x-4 gap-y-5 sm:gap-y-6 grid-cols-2 xl:grid-cols-4">
            {others.map(s => <StreamCard key={s.slug} streamer={s} />)}
          </div>
        </section>
      )}
    </div>
  )
}
