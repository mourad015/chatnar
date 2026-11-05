'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Clock, Lock, Trophy, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCoins, formatCount, getStreamer, type Prediction } from '@/lib/data'
import { useCoins } from './CoinsProvider'
import { Avatar } from './ui'

const AMOUNTS = [100, 500, 1000]

function useCountdown(start: number) {
  const [left, setLeft] = useState(start)
  useEffect(() => {
    if (start <= 0) return
    const t = setInterval(() => setLeft(l => Math.max(0, l - 1)), 1000)
    return () => clearInterval(t)
  }, [start])
  return left
}

function mmss(s: number) {
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function PredictionCard({ prediction, showStreamer = true, className }: {
  prediction: Prediction
  showStreamer?: boolean
  className?: string
}) {
  const { coins, picks, placePick } = useCoins()
  const streamer = getStreamer(prediction.streamer)
  const left = useCountdown(prediction.status === 'open' ? prediction.secondsLeft : 0)
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const [amount, setAmount] = useState(500)
  const [extra, setExtra] = useState<[number, number]>([0, 0])

  const myPick = picks[prediction.id]
  const resolved = prediction.status === 'resolved'
  const closed = resolved || left === 0
  const pools = prediction.options.map((o, i) => o.pool + extra[i]) as [number, number]
  const total = pools[0] + pools[1]

  function lockIn() {
    if (selected === null) return
    if (placePick(prediction.id, selected, amount)) {
      setExtra(e => (selected === 0 ? [e[0] + amount, e[1]] : [e[0], e[1] + amount]))
      setSelected(null)
    }
  }

  const urgent = !closed && left <= 60

  return (
    <div className={cn('chatnar-card p-4 flex flex-col gap-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        {showStreamer && streamer ? (
          <Link href={`/stream/${streamer.slug}`} className="flex items-center gap-2 min-w-0 group">
            <Avatar name={streamer.name} hue={streamer.hue} size={24} />
            <span className="text-xs font-semibold text-brand-muted group-hover:text-white truncate">{streamer.name}</span>
          </Link>
        ) : <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Prediction</span>}

        {resolved ? (
          <span className="text-[11px] font-bold text-brand-muted inline-flex items-center gap-1"><Trophy className="w-3 h-3" /> RESULT</span>
        ) : closed ? (
          <span className="text-[11px] font-bold text-brand-muted inline-flex items-center gap-1"><Lock className="w-3 h-3" /> LOCKED</span>
        ) : (
          <span className={cn(
            'text-[11px] font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-full tabular-nums',
            urgent ? 'bg-brand-red/15 text-brand-red' : 'bg-brand-orange/15 text-brand-orange',
          )}>
            <Clock className="w-3 h-3" /> {mmss(left)}
          </span>
        )}
      </div>

      <div className="font-bold text-white leading-snug">{prediction.question}</div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {prediction.options.map((o, i) => {
          const idx = i as 0 | 1
          const pct = total ? Math.round((pools[i] / total) * 100) : 50
          const mult = pools[i] ? (total / pools[i]).toFixed(2) : '—'
          const isPicked = myPick?.option === idx
          const isWinner = resolved && prediction.winner === idx
          const isSelected = selected === idx
          const disabled = closed || !!myPick
          return (
            <button
              key={o.label}
              disabled={disabled}
              onClick={() => setSelected(isSelected ? null : idx)}
              className={cn(
                'relative overflow-hidden rounded-md border px-3 py-2.5 text-left transition-all',
                idx === 0 ? 'border-brand-green/50' : 'border-brand-red/50',
                !disabled && (idx === 0 ? 'hover:border-brand-green hover:shadow-green' : 'hover:border-brand-red hover:shadow-red'),
                isSelected && (idx === 0 ? 'border-brand-green shadow-green' : 'border-brand-red shadow-red'),
                (isPicked || isWinner) && (idx === 0 ? 'border-brand-green' : 'border-brand-red'),
                disabled && !isPicked && !isWinner && 'opacity-50',
              )}
            >
              <div
                className={cn('absolute inset-y-0 left-0 transition-all duration-500', idx === 0 ? 'bg-brand-green/15' : 'bg-brand-red/15')}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between">
                <span className={cn('font-display text-xl tracking-wide', idx === 0 ? 'text-brand-green' : 'text-brand-red')}>
                  {o.label}
                </span>
                <span className="text-sm font-bold text-white tabular-nums">{pct}%</span>
              </div>
              <div className="relative flex items-center justify-between text-[11px] text-brand-muted mt-0.5">
                <span>x{mult}</span>
                <span>🪙 {formatCount(pools[i])}</span>
              </div>
              {(isPicked || isWinner) && (
                <span className="absolute top-1 right-1 text-[9px] font-extrabold bg-white text-black px-1 rounded">
                  {isWinner ? 'WON' : 'YOU'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Amount picker */}
      {selected !== null && !closed && !myPick && (
        <div className="flex flex-col gap-2 animate-coin-drop">
          <div className="flex gap-1.5">
            {AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={cn(
                  'flex-1 text-xs font-bold py-1.5 rounded border transition-colors',
                  amount === a ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-brand-border text-brand-muted hover:text-white',
                )}
              >
                {formatCount(a)}
              </button>
            ))}
            <button
              onClick={() => setAmount(coins)}
              className={cn(
                'flex-1 text-xs font-bold py-1.5 rounded border transition-colors',
                amount === coins ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-brand-border text-brand-muted hover:text-white',
              )}
            >
              ALL IN
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={lockIn} className="btn-orange flex-1 py-2 text-sm">
              Lock {prediction.options[selected].label} · 🪙 {formatCoins(amount)}
            </button>
            <button
              onClick={() => setSelected(null)}
              aria-label="Cancel"
              className="w-10 rounded-md border border-brand-border text-brand-muted hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[11px] text-brand-muted text-center">
            Win up to <span className="text-brand-gold font-bold">🪙 {formatCoins(Math.floor(amount * (total + amount) / (pools[selected] + amount)))}</span>
          </div>
        </div>
      )}

      {myPick && (
        <div className="text-xs text-brand-muted bg-white/5 rounded px-3 py-2">
          You picked <span className="text-white font-bold">{prediction.options[myPick.option].label}</span> with{' '}
          <span className="text-brand-gold font-bold">🪙 {formatCoins(myPick.amount)}</span>
          {!closed && ' — fingers crossed 🤞'}
        </div>
      )}

      {!myPick && !closed && selected === null && (
        <div className="text-[11px] text-brand-muted">
          {formatCount(Math.round(total / 220))} predicting · pool 🪙 {formatCount(total)}
        </div>
      )}
    </div>
  )
}
