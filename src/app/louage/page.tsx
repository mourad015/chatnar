'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { BellIcon, CalendarDays, Check, ChevronRight, Flag, MapPin, Package, Users } from './_components/icons'
import { DestArt, HeroArt } from './_components/art'
import { Logo, Toast, cx, tap } from './_components/ui'
import { Results } from './_components/rider'
import { CITIES, POPULAR, formatPrice, stationFor, suggestedPrice } from './_lib/data'
import { useBlassa } from './_lib/store'
import s from './louage.module.css'

export default function RiderHome() {
  const { user } = useBlassa()
  const [from, setFrom] = useState('Tunis')
  const [to, setTo] = useState('Sousse')
  const [day, setDay] = useState<'today' | 'tomorrow'>('today')
  const [pax, setPax] = useState(1)
  const [view, setView] = useState<'home' | 'results'>('home')
  const [toast, setToast] = useState<string | null>(null)
  const hideToast = useCallback(() => setToast(null), [])

  if (view === 'results') {
    return (
      <div className={s.page}>
        <Results from={from} to={to} onBack={() => setView('home')} />
      </div>
    )
  }

  const search = () => {
    tap()
    setView('results')
    window.scrollTo(0, 0)
  }

  return (
    <>
      <header className={s.header}>
        <Logo />
        <button type="button" className={s.iconBtn} aria-label="Notifications" onClick={() => setToast('Ma fama 7atta notification jdida')}>
          <BellIcon size={20} />
          <span className={s.badgeDot} />
        </button>
      </header>

      <h1 className={s.homeTitle}>
        Win bech{' '}
        <span className={s.swooshWord}>
          temchi
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden>
            <path d="M0 8 C30 1 70 0 100 4 C70 4 35 5 0 8 Z" fill="var(--red)" />
          </svg>
        </span>{' '}
        ?
      </h1>
      {user && <p className={s.muted} style={{ marginTop: 10, fontSize: 14.5 }}>Ahla {user.name.split(' ')[0]}, chouf el louages el fergha taw.</p>}

      <div className={s.heroArt}>
        <HeroArt />
      </div>

      <section className={s.searchCard} aria-label="Recherche">
        <label className={cx(s.sRow, s.sRowBox)}>
          <MapPin size={20} className={s.sIcon} />
          <span className={s.sText}>
            <span className={s.sLabel}>منين؟ · Départ</span>
            <span className={s.sValue}>{from} - {stationFor(from, to || 'Sousse').replace('Station ', '')}</span>
          </span>
          <ChevronRight size={18} className={s.sChevron} />
          <select className={s.fieldSelect} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Départ">
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className={cx(s.sRow, s.sRowBox)}>
          <Flag size={20} className={s.sIcon} />
          <span className={s.sText}>
            <span className={s.sLabel}>وين؟ · Destination</span>
            <span className={s.sValue}>{to || 'Ay blassa'}</span>
          </span>
          <ChevronRight size={18} className={s.sChevron} />
          <select className={s.fieldSelect} value={to} onChange={(e) => setTo(e.target.value)} aria-label="Destination">
            <option value="">Ay blassa</option>
            {CITIES.filter((c) => c !== from).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div className={s.sSplit}>
          <label className={s.sMini}>
            <span><CalendarDays size={18} /> <span className={s.sMiniAr}>{day === 'today' ? 'اليوم' : 'غدوة'}</span></span>
            <ChevronRight size={16} className={s.sChevron} />
            <select className={s.fieldSelect} value={day} onChange={(e) => setDay(e.target.value as 'today' | 'tomorrow')} aria-label="Jour">
              <option value="today">Aujourd&apos;hui</option>
              <option value="tomorrow">Demain</option>
            </select>
          </label>
          <label className={s.sMini}>
            <span><Users size={18} /> <span className={s.sMiniAr}>{pax} مسافر</span></span>
            <ChevronRight size={16} className={s.sChevron} />
            <select className={s.fieldSelect} value={pax} onChange={(e) => setPax(Number(e.target.value))} aria-label="Passagers">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <button type="button" className={cx(s.btn, s.btnPrimary, s.btnBlock, s.searchBtn)} onClick={search}>
          Chercher un louage
        </button>
      </section>

      <Link href="/louage/colis" className={s.colisBanner}>
        <span className={s.colisIcon}><Package size={22} /></span>
        <span style={{ flex: 1 }}>
          <b>Ab3ath colis b louage</b>
          <span>Mel 5 DT, yousel nafs el nhar</span>
        </span>
        <ChevronRight size={18} className={s.sChevron} />
      </Link>

      <div className={s.sectionRow}>
        <h2>Destinations populaires</h2>
        <button type="button" className={s.seeAll} onClick={() => { setTo(''); search() }}>
          Voir tout <ChevronRight size={15} />
        </button>
      </div>
      <div className={s.dests}>
        {POPULAR.filter((c) => c !== from).map((c) => (
          <button
            key={c}
            type="button"
            className={s.dest}
            onClick={() => {
              setTo(c)
              search()
            }}
          >
            <span className={s.destArt}><DestArt city={c} /></span>
            <span className={s.destName}>{c}</span>
            <span className={s.destPrice}>dès {formatPrice(suggestedPrice(from, c))} DT</span>
          </button>
        ))}
      </div>

      {toast && (
        <Toast onDone={hideToast}>
          <Check size={16} /> {toast}
        </Toast>
      )}
    </>
  )
}
