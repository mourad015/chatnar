import type { Metadata } from 'next'
import PredictionCard from '@/components/PredictionCard'
import { SectionTitle } from '@/components/ui'
import { PREDICTIONS, openPredictions } from '@/lib/data'

export const metadata: Metadata = { title: 'Predictions — ChatNar' }

export default function PredictionsPage() {
  const open = openPredictions().sort((a, b) => a.secondsLeft - b.secondsLeft)
  const results = PREDICTIONS.filter(p => p.status === 'resolved')

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col gap-10">
      <section>
        <SectionTitle kicker={`${open.length} open now`} title="LIVE PREDICTIONS" />
        <p className="text-sm text-brand-muted -mt-1 mb-4">Tap a side, choose your coins, lock it in. Closing soonest first.</p>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {open.map(p => <PredictionCard key={p.id} prediction={p} />)}
        </div>
      </section>

      <section>
        <SectionTitle kicker="Just settled" title="RESULTS" />
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {results.map(p => <PredictionCard key={p.id} prediction={p} />)}
        </div>
      </section>
    </div>
  )
}
