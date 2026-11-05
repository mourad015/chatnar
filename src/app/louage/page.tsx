'use client'

import { useCallback, useMemo, useState } from 'react'
import { ArrowUpDown, Check, Clock, MapPin, Navigation, Phone, Search, Star, Users } from './_components/icons'
import { Avatar, DepartureCard, Logo, Plate, Seats, Sheet, StatusPill, Toast, cx, seatsLeftLabel } from './_components/ui'
import { CITIES, POPULAR, formatPrice, type Departure } from './_lib/data'
import { HOLD_MINUTES, useBlassa } from './_lib/store'
import s from './louage.module.css'

type Filter = 'all' | 'full-leave' | 'timed'

export default function RiderHome() {
  const { departures, ready, now } = useBlassa()
  const [from, setFrom] = useState('Tunis')
  const [to, setTo] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  const results = useMemo(() => {
    return departures
      .filter((d) => d.from === from && (!to || d.to === to))
      .filter((d) => (filter === 'timed' ? !!d.departAt : filter === 'full-leave' ? !d.departAt : true))
      .sort((a, b) => {
        // Open trips first, then the ones closest to leaving.
        if (a.status !== b.status) return a.status === 'open' ? -1 : 1
        const score = (d: Departure) => (d.departAt ? d.departAt - now : (d.seats - d.filled) * 6 * 60_000)
        return score(a) - score(b)
      })
  }, [departures, from, to, filter, now])

  const totalOpen = departures.filter((d) => d.status === 'open').length
  const open = departures.find((d) => d.id === openId) ?? null
  const close = useCallback(() => setOpenId(null), [])

  const swap = () => {
    if (!to) return
    setFrom(to)
    setTo(from)
  }

  return (
    <>
      <header className={s.topbar}>
        <Logo />
        <span className={s.livePill}>
          <span className={s.pulse} />
          {ready ? `${totalOpen} louage live` : 'Live'}
        </span>
      </header>

      <section className={s.hero}>
        <p className={s.eyebrow} style={{ color: 'var(--hero-muted)' }}>Louage · Tounes</p>
        <h1 className={cx(s.display, s.heroTitle)}>
          Win mechi <em>lyoum?</em>
        </h1>
        <p className={s.heroSub}>Chouf el blayes el fergha w el soum 9bal ma temchi lel station.</p>

        <div className={s.search}>
          <label className={s.field}>
            <span className={s.fieldIcon}><Navigation size={15} /></span>
            <span className={s.fieldText}>
              <span className={s.fieldLabel}>Mnin</span>
              <span className={s.fieldValue}>{from}</span>
            </span>
            <select className={s.fieldSelect} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Mnin">
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className={s.field}>
            <span className={cx(s.fieldIcon, s.fieldIconTo)}><MapPin size={15} /></span>
            <span className={s.fieldText}>
              <span className={s.fieldLabel}>Win</span>
              <span className={cx(s.fieldValue, !to && s.fieldPlaceholder)}>{to || 'Ay blassa'}</span>
            </span>
            <select className={s.fieldSelect} value={to} onChange={(e) => setTo(e.target.value)} aria-label="Win">
              <option value="">Ay blassa</option>
              {CITIES.filter((c) => c !== from).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <button type="button" className={s.swap} onClick={swap} aria-label="Badel el ittijah" disabled={!to}>
            <ArrowUpDown size={18} />
          </button>
        </div>

        <div className={s.chips}>
          <button type="button" className={cx(s.chip, !to && s.chipOn)} onClick={() => setTo('')}>El kol</button>
          {POPULAR.filter((c) => c !== from).map((c) => (
            <button key={c} type="button" className={cx(s.chip, to === c && s.chipOn)} onClick={() => setTo(c)}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <div className={s.sectionHead}>
        <div>
          <p className={s.eyebrow}>Départs taw</p>
          <h2 className={cx(s.display, s.sectionTitle)}>
            {from} {to ? `→ ${to}` : ''}
          </h2>
        </div>
        <span className={s.muted} style={{ fontSize: 13 }}>{ready ? `${results.length} louage` : ''}</span>
      </div>

      <div className={s.segment} role="tablist" aria-label="Filtre">
        {([
          ['all', 'El kol'],
          ['full-leave', 'Ki yo3mer'],
          ['timed', 'B wa9t'],
        ] as [Filter, string][]).map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={filter === k}
            className={cx(s.segBtn, filter === k && s.segOn)}
            onClick={() => setFilter(k)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={s.list}>
        {!ready && [0, 1, 2].map((i) => <div key={i} className={s.skeleton} />)}
        {ready && results.length === 0 && (
          <div className={s.empty}>
            <span className={s.emptyIcon}><Search size={22} /></span>
            <h3 className={cx(s.display, s.emptyTitle)}>Ma fama 7atta louage taw</h3>
            <p className={s.muted} style={{ fontSize: 14 }}>
              Lel trajet hedha ma fama 7atta départ. Jarreb blassa okhra, wala erja3 ba3d chwaya.
            </p>
          </div>
        )}
        {results.map((d, i) => (
          <DepartureCard key={d.id} d={d} index={i} onOpen={() => setOpenId(d.id)} />
        ))}
      </div>

      {open && <DepartureSheet d={open} onClose={close} />}
    </>
  )
}

function DepartureSheet({ d, onClose }: { d: Departure; onClose: () => void }) {
  const { now, reserve, cancelReservation, isReserved } = useBlassa()
  const [toast, setToast] = useState<string | null>(null)
  const reserved = isReserved(d.id)
  const left = d.seats - d.filled
  const hideToast = useCallback(() => setToast(null), [])

  return (
    <Sheet onClose={onClose} label={`${d.from} vers ${d.to}`}>
      <StatusPill d={d} now={now} />
      <h2 className={cx(s.display, s.sheetRoute)}>
        {d.from} → {d.to}
      </h2>
      <p className={s.muted} style={{ fontSize: 14 }}>
        {d.kind === 'regional' ? 'Louage régional (khatt azra9)' : 'Louage interurbain (khatt a7mar)'}
      </p>

      <div className={s.timeline}>
        <div className={s.stop}>
          <span className={s.stopDot} />
          <div>
            <div className={s.stopCity}>{d.from}</div>
            <div className={s.stopSub}>{d.station}</div>
          </div>
        </div>
        <span className={s.stopLine} aria-hidden />
        <div className={s.stop}>
          <span className={cx(s.stopDot, s.stopDotEnd)} />
          <div>
            <div className={s.stopCity}>{d.to}</div>
            <div className={s.stopSub}>Station louage {d.to}</div>
          </div>
        </div>
      </div>

      <div className={s.facts}>
        <div className={s.fact}>
          <div className={s.eyebrow}>Soum</div>
          <div className={s.factValue}>{formatPrice(d.price)} DT</div>
        </div>
        <div className={s.fact}>
          <div className={s.eyebrow}>Fergha</div>
          <div className={s.factValue}>{left}/{d.seats}</div>
        </div>
        <div className={s.fact}>
          <div className={s.eyebrow}>Départ</div>
          <div className={s.factValue} style={{ fontSize: d.departAt ? 20 : 15 }}>
            {d.departAt ? new Date(d.departAt).toTimeString().slice(0, 5) : 'Ki yo3mer'}
          </div>
        </div>
      </div>

      <div className={s.seatBox}>
        <div className={s.panelTitle} style={{ marginBottom: 12 }}>
          <span className={s.display} style={{ fontSize: 17 }}>Blayes</span>
          <span className={cx(s.left, left <= 2 && left > 0 && s.leftLow)}>{seatsLeftLabel(d)}</span>
        </div>
        <Seats total={d.seats} filled={d.filled} mine={reserved ? 1 : 0} large />
        <div className={s.legend}>
          <span><i className={s.legendSwatch} /> Fergha</span>
          <span><i className={s.legendSwatch} style={{ background: 'var(--ink)', borderColor: 'var(--ink)' }} /> Ma3mra</span>
          <span><i className={s.legendSwatch} style={{ background: 'var(--red)', borderColor: 'var(--red)' }} /> Blastek</span>
        </div>
      </div>

      <div className={s.driverBox}>
        <div className={s.driver}>
          <Avatar name={d.driver.name} />
          <div>
            <div className={s.driverName}>{d.driver.name}</div>
            <div className={s.driverMeta}>
              <Star size={12} className={s.star} /> {d.driver.rating.toFixed(1)} · <Users size={12} /> {d.driver.trips} trajet
            </div>
          </div>
        </div>
        <Plate value={d.driver.plate} />
      </div>

      {reserved && (
        <div className={s.confirm}>
          <Check size={22} />
          <div>
            <strong>Blastek m7foudha!</strong>
            El chifour yestannek {HOLD_MINUTES} dkika. Ken bech tet3atel, ekleblou.
          </div>
        </div>
      )}

      <div className={s.row}>
        <a className={cx(s.btn, s.btnGhost)} href={`tel:${d.driver.phone.replace(/\s/g, '')}`}>
          <Phone size={18} /> Ekleb
        </a>
        {reserved ? (
          <button
            type="button"
            className={cx(s.btn, s.btnInk)}
            onClick={() => {
              cancelReservation(d.id)
              setToast('Blastek tna77at')
            }}
          >
            Batel
          </button>
        ) : (
          <button
            type="button"
            className={cx(s.btn, s.btnRed)}
            disabled={left <= 0}
            onClick={() => {
              reserve(d.id)
              setToast('Mrigel, blastek m7foudha')
            }}
          >
            {left <= 0 ? 'Complet' : 'Hezli blassa'}
          </button>
        )}
      </div>
      <p className={s.demoNote}>
        <Clock size={11} style={{ verticalAlign: '-1px' }} /> Tkhalles lel chifour fel louage, kima dima.
      </p>

      {toast && (
        <Toast onDone={hideToast}>
          <Check size={16} /> {toast}
        </Toast>
      )}
    </Sheet>
  )
}
