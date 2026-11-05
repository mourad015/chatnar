import type { Metadata } from 'next'
import Link from 'next/link'
import StreamCard from '@/components/StreamCard'
import { SectionTitle } from '@/components/ui'
import { CATEGORIES, STREAMERS, getCategory } from '@/lib/data'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Browse — ChatNar' }

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>
}) {
  const { c } = await searchParams
  const category = c ? getCategory(c) : undefined
  const list = STREAMERS
    .filter(s => s.live && (!category || s.category === category.id))
    .sort((a, b) => b.viewers - a.viewers)

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col gap-6">
      <SectionTitle kicker="Live in Tunisia" title={category ? `${category.emoji} ${category.label.toUpperCase()}` : 'BROWSE'} />

      <div className="-mx-4 px-4 flex gap-2 overflow-x-auto no-scrollbar">
        <Link href="/streams" className={cn('tn-tag whitespace-nowrap', !category && 'border-brand-orange text-brand-orange')}>All</Link>
        {CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            href={`/streams?c=${cat.id}`}
            className={cn('tn-tag whitespace-nowrap', category?.id === cat.id && 'border-brand-orange text-brand-orange')}
          >
            {cat.emoji} {cat.label}
          </Link>
        ))}
      </div>

      {list.length > 0 ? (
        <div className="grid gap-x-3 sm:gap-x-4 gap-y-5 sm:gap-y-6 grid-cols-2 xl:grid-cols-4">
          {list.map(s => <StreamCard key={s.slug} streamer={s} />)}
        </div>
      ) : (
        <div className="chatnar-card p-10 text-center">
          <div className="text-4xl mb-2">😴</div>
          <div className="font-bold text-white">Nobody&apos;s live here right now</div>
          <div className="text-sm text-brand-muted mt-1">Check back tonight — that&apos;s when things heat up.</div>
        </div>
      )}
    </div>
  )
}
