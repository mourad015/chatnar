'use client'

import { useState } from 'react'
import { ChevronRight, Heart, Van } from '../_components/icons'
import { Results } from '../_components/rider'
import { cx, tap } from '../_components/ui'
import { formatPrice } from '../_lib/data'
import { useBlassa } from '../_lib/store'
import s from '../louage.module.css'

export default function FavoritesPage() {
  const { favorites, departures, ready, toggleFavorite } = useBlassa()
  const [route, setRoute] = useState<[string, string] | null>(null)

  if (route) {
    return (
      <div className={s.page}>
        <Results from={route[0]} to={route[1]} onBack={() => setRoute(null)} />
      </div>
    )
  }

  const list = (favorites ?? []).map((k) => k.split('|') as [string, string])

  return (
    <>
      <div className={s.pageHead} style={{ marginTop: 18 }}>
        <h1 className={cx(s.display, s.pageTitle)}>Mes favoris</h1>
        <p className={s.muted}>Vos trajets habituels, avec les places disponibles en direct.</p>
      </div>
      {ready && list.length === 0 && (
        <div className={s.empty}>
          <span className={s.emptyIcon}><Heart size={22} /></span>
          <h3 className={cx(s.display, s.emptyTitle)}>Pas encore de favoris</h3>
          <p className={s.muted} style={{ fontSize: 14 }}>Touchez le cœur sur un louage pour garder ce trajet ici.</p>
        </div>
      )}
      {list.length > 0 && (
        <div className={s.menu}>
          {list.map(([from, to]) => {
            const open = departures.filter((d) => d.from === from && d.to === to && d.status === 'open')
            const seats = open.reduce((n, d) => n + d.seats - d.filled, 0)
            const cheapest = open.length ? Math.min(...open.map((d) => d.price)) : null
            return (
              <div key={`${from}|${to}`} className={s.menuRow} style={{ minHeight: 72 }}>
                <button
                  type="button"
                  onClick={() => {
                    tap()
                    setRoute([from, to])
                  }}
                  style={{ all: 'unset', flex: 1, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                >
                  <Van width={48} />
                  <span style={{ flex: 1 }}>
                    <b style={{ display: 'block' }}>{from} → {to}</b>
                    <span className={s.muted} style={{ fontSize: 13 }}>
                      {open.length ? `${open.length} louage · ${seats} places · dès ${formatPrice(cheapest!)} DT` : 'Aucun louage pour le moment'}
                    </span>
                  </span>
                  <ChevronRight size={18} className={s.sChevron} />
                </button>
                <button type="button" className={cx(s.favBtn, s.favOn)} onClick={() => toggleFavorite(from, to)} aria-label="Retirer des favoris">
                  <Heart size={18} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
