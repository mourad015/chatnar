'use client'

import { useState } from 'react'
import { MessageCircle, Trophy, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LEADERBOARD, formatCoins, type Prediction } from '@/lib/data'
import PredictionCard from './PredictionCard'
import { Avatar } from './ui'

const CHAT = [
  { user: 'Rayen9',       hue: 200, text: 'YES all in, trust 🔥' },
  { user: 'Mimi.Sfax',    hue: 320, text: 'chbik ya5i 😂😂' },
  { user: 'Aziz_Bizerte', hue: 0,   text: 'last time he choked, NO for me' },
  { user: 'Nour.TN',      hue: 175, text: 'ahla bik from Monastir 👋' },
  { user: 'Yassine_TN',   hue: 14,  text: 'x2.4 on NO is free coins' },
  { user: 'Eya.Nabeul',   hue: 90,  text: 'yezzi stop the hype 😭' },
]

const TABS = [
  { id: 'predict', label: 'Predict', icon: Zap },
  { id: 'chat',    label: 'Chat',    icon: MessageCircle },
  { id: 'top',     label: 'Top',     icon: Trophy },
] as const

export default function StreamPanel({ predictions }: { predictions: Prediction[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('predict')
  const open = predictions.filter(p => p.status === 'open')
  const done = predictions.filter(p => p.status === 'resolved')

  return (
    <div className="chatnar-card flex flex-col lg:h-full overflow-hidden">
      <div className="grid grid-cols-3 border-b border-brand-border shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center justify-center gap-1.5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors',
              tab === t.id ? 'text-brand-orange border-brand-orange' : 'text-brand-muted border-transparent hover:text-white',
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.id === 'predict' && open.length > 0 && (
              <span className="bg-brand-orange text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{open.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-3 flex flex-col gap-3">
        {tab === 'predict' && (
          <>
            {open.length === 0 && (
              <div className="text-center py-8">
                <div className="text-3xl mb-1">⏳</div>
                <div className="text-sm font-semibold text-white">No prediction open</div>
                <div className="text-xs text-brand-muted">The streamer will drop one soon. Stay close.</div>
              </div>
            )}
            {open.map(p => <PredictionCard key={p.id} prediction={p} showStreamer={false} />)}
            {done.length > 0 && (
              <>
                <div className="text-[11px] font-extrabold tracking-[0.15em] text-brand-muted uppercase mt-2">Earlier</div>
                {done.map(p => <PredictionCard key={p.id} prediction={p} showStreamer={false} />)}
              </>
            )}
          </>
        )}

        {tab === 'chat' && (
          <>
            {CHAT.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Avatar name={m.user} hue={m.hue} size={22} />
                <p className="min-w-0">
                  <span className="font-bold" style={{ color: `hsl(${m.hue} 85% 65%)` }}>{m.user}</span>{' '}
                  <span className="text-white/90">{m.text}</span>
                </p>
              </div>
            ))}
            <div className="text-[11px] text-brand-muted text-center mt-2">Chat goes live once Kick chat is connected.</div>
          </>
        )}

        {tab === 'top' && (
          <ol className="flex flex-col">
            {LEADERBOARD.slice(0, 8).map((u, i) => (
              <li key={u.name} className="flex items-center gap-2.5 py-2 border-b border-brand-border last:border-0">
                <span className={cn('w-5 text-center font-display text-lg', i < 3 ? 'text-brand-gold' : 'text-brand-muted')}>{i + 1}</span>
                <Avatar name={u.name} hue={u.hue} size={26} />
                <span className="flex-1 text-sm font-semibold text-white truncate">{u.name}</span>
                <span className="text-xs font-bold text-brand-gold tabular-nums">🪙 {formatCoins(u.coins)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
