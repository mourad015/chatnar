'use client'

import { useCallback, useState } from 'react'
import { Car } from '../_components/icons'
import { DepartureSheet, ResCard } from '../_components/rider'
import { cx } from '../_components/ui'
import { HOLD_MINUTES, useBlassa } from '../_lib/store'
import s from '../louage.module.css'

export default function TripsPage() {
  const { departures, reservations, ready, now } = useBlassa()
  const [openId, setOpenId] = useState<string | null>(null)
  const close = useCallback(() => setOpenId(null), [])
  const mine = reservations
    .map((r) => ({ r, d: departures.find((d) => d.id === r.departureId) }))
    .filter((x): x is { r: (typeof reservations)[number]; d: NonNullable<typeof x.d> } => !!x.d)
  const open = departures.find((d) => d.id === openId) ?? null

  return (
    <>
      <div className={s.pageHead} style={{ marginTop: 18 }}>
        <h1 className={cx(s.display, s.pageTitle)}>Mes trajets</h1>
        <p className={s.muted}>Vos places réservées. Le chauffeur vous attend {HOLD_MINUTES} min.</p>
      </div>
      {!ready && <div className={s.skeleton} style={{ height: 170 }} />}
      {ready && mine.length === 0 && (
        <div className={s.empty}>
          <span className={s.emptyIcon}><Car size={22} /></span>
          <h3 className={cx(s.display, s.emptyTitle)}>Aucun trajet pour le moment</h3>
          <p className={s.muted} style={{ fontSize: 14 }}>Cherchez un louage depuis l&apos;accueil et réservez votre place.</p>
        </div>
      )}
      <div className={s.resList}>
        {mine.map(({ r, d }, i) => (
          <div key={d.id}>
            <p className={s.eyebrow} style={{ margin: '0 2px 8px' }}>
              Réservée · expire dans {Math.max(0, HOLD_MINUTES - Math.floor((now - r.at) / 60_000))} min
            </p>
            <ResCard d={d} index={i} onOpen={() => setOpenId(d.id)} />
          </div>
        ))}
      </div>
      {open && <DepartureSheet d={open} onClose={close} />}
    </>
  )
}
