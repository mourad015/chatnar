'use client'

import { useCallback, useMemo, useState } from 'react'
import { ArrowUpDown, Bus, CarTaxiFront, Check, Copy, Phone, Search, Star, TramFront, Users, Van } from './_components/icons'
import { Avatar, Logo, OptionRow, Plate, Seats, Sheet, StatusPill, Toast, cx, seatsLeftLabel } from './_components/ui'
import { CITIES, POPULAR, formatClock, formatPrice, type Departure } from './_lib/data'
import { HOLD_MINUTES, useBlassa } from './_lib/store'
import s from './louage.module.css'

type Filter = 'all' | 'full-leave' | 'timed'

const MODES = [
  { id: 'louage', label: 'Louage', art: <Van width={50} />, soon: false },
  { id: 'taxi', label: 'Taxi', art: <CarTaxiFront size={30} />, soon: true },
  { id: 'car', label: 'Car', art: <Bus size={30} />, soon: true },
  { id: 'metro', label: 'Métro', art: <TramFront size={30} />, soon: true },
]

export default function RiderHome() {
  const { departures, ready, now } = useBlassa()
  const [from, setFrom] = useState('Tunis')
  const [to, setTo] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const hideToast = useCallback(() => setToast(null), [])

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
  const selected = departures.find((d) => d.id === selectedId) ?? null
  const close = useCallback(() => setSheetOpen(false), [])

  const swap = () => {
    if (!to) return
    setFrom(to)
    setTo(from)
    setSelectedId(null)
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

      <h1 className={cx(s.display, s.greet)}>Win mechi lyoum?</h1>

      <div className={s.where}>
        <span className={s.whereLine} aria-hidden />
        <label className={s.whereRow}>
          <span className={s.whereMark} />
          <span className={s.whereText}>
            <span className={s.whereLabel}>Mnin</span>
            <span className={s.whereValue}>{from}</span>
          </span>
          <select className={s.fieldSelect} value={from} onChange={(e) => { setFrom(e.target.value); setSelectedId(null) }} aria-label="Mnin">
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className={s.whereRow}>
          <span className={cx(s.whereMark, s.whereMarkSq)} />
          <span className={s.whereText}>
            <span className={s.whereLabel}>Win</span>
            <span className={cx(s.whereValue, !to && s.wherePlaceholder)}>{to || 'Ay blassa'}</span>
          </span>
          <select className={s.fieldSelect} value={to} onChange={(e) => { setTo(e.target.value); setSelectedId(null) }} aria-label="Win">
            <option value="">Ay blassa</option>
            {CITIES.filter((c) => c !== from).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <button type="button" className={s.swap} onClick={swap} aria-label="Badel el ittijah" disabled={!to}>
          <ArrowUpDown size={18} />
        </button>
      </div>

      <div className={s.tilesHead}>
        <h2 className={cx(s.display, s.tilesTitle)}>Kifech bech temchi</h2>
      </div>
      <div className={s.tiles}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={cx(s.tile, !m.soon && s.tileOn, m.soon && s.tileDim)}
            onClick={() => m.soon && setToast(`${m.label}: 9rib fel appli`)}
            aria-pressed={!m.soon}
          >
            {m.soon && <span className={s.tileSoon}>9rib</span>}
            <span className={s.tileArt}>{m.art}</span>
            <span className={s.tileLabel}>{m.label}</span>
          </button>
        ))}
      </div>

      <div className={s.sectionHead}>
        <h2 className={cx(s.display, s.sectionTitle)}>Louage men {from}</h2>
        <span className={s.muted} style={{ fontSize: 13 }}>{ready ? `${results.length} départ` : ''}</span>
      </div>

      <div className={s.chips}>
        <button type="button" className={cx(s.chip, !to && s.chipOn)} onClick={() => setTo('')}>El kol</button>
        {POPULAR.filter((c) => c !== from).map((c) => (
          <button key={c} type="button" className={cx(s.chip, to === c && s.chipOn)} onClick={() => { setTo(c); setSelectedId(null) }}>
            {c}
          </button>
        ))}
      </div>

      <div className={s.segment} role="tablist" aria-label="Filtre" style={{ margin: '6px 0 10px' }}>
        {([
          ['all', 'Ay wa9t'],
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

      <div className={s.list} style={{ paddingBottom: selected ? 84 : 0 }}>
        {!ready && [0, 1, 2, 3].map((i) => <div key={i} className={s.skeleton} />)}
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
          <OptionRow
            key={d.id}
            d={d}
            index={i}
            selected={selectedId === d.id}
            onSelect={() => (selectedId === d.id ? setSheetOpen(true) : setSelectedId(d.id))}
          />
        ))}
      </div>

      {selected && !sheetOpen && (
        <div className={s.ctaBar}>
          <button type="button" className={cx(s.btn, s.btnPrimary, s.btnBlock)} onClick={() => setSheetOpen(true)}>
            Ekhtar {selected.from} → {selected.to} · {formatPrice(selected.price)} DT
          </button>
        </div>
      )}

      {selected && sheetOpen && <DepartureSheet d={selected} onClose={close} />}

      {toast && (
        <Toast onDone={hideToast}>
          <Check size={16} /> {toast}
        </Toast>
      )}
    </>
  )
}

function DepartureSheet({ d, onClose }: { d: Departure; onClose: () => void }) {
  const { now, reserve, cancelReservation, isReserved } = useBlassa()
  const [toast, setToast] = useState<string | null>(null)
  const reserved = isReserved(d.id)
  const left = d.seats - d.filled
  const hideToast = useCallback(() => setToast(null), [])

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(d.driver.phone)
      setToast('Numéro tcopia')
    } catch {
      setToast(d.driver.phone)
    }
  }

  return (
    <Sheet onClose={onClose} label={`${d.from} vers ${d.to}`}>
      <div className={s.sheetHero}>
        <Van width={150} stripe={d.kind === 'regional' ? 'blue' : 'red'} />
      </div>
      <StatusPill d={d} now={now} />
      <h2 className={cx(s.display, s.sheetRoute)}>
        {d.from} → {d.to}
      </h2>
      <p className={s.muted} style={{ fontSize: 14 }}>
        {d.kind === 'regional' ? 'Louage régional · khatt azra9' : 'Louage interurbain · khatt a7mar'}
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
          <div className={s.factValue} style={{ fontSize: d.departAt ? 18 : 15 }}>
            {d.departAt ? formatClock(d.departAt) : 'Ki yo3mer'}
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
          <span><i className={s.legendSwatch} style={{ background: 'var(--ink)' }} /> Ma3mra</span>
          <span><i className={s.legendSwatch} style={{ background: 'var(--red)' }} /> Blastek</span>
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

      <div className={s.phoneRow}>
        <span className={s.phoneNum}>{d.driver.phone}</span>
        <span className={s.row} style={{ flex: 'none', gap: 6 }}>
          <button type="button" className={cx(s.btn, s.btnGhost, s.btnSm)} style={{ background: 'var(--surface)' }} onClick={copyPhone} aria-label="Copier le numéro">
            <Copy size={16} />
          </button>
          <a className={cx(s.btn, s.btnGhost, s.btnSm)} style={{ background: 'var(--surface)' }} href={`tel:${d.driver.phone.replace(/\s/g, '')}`} aria-label="Ekleb">
            <Phone size={16} />
          </a>
        </span>
      </div>

      {reserved && (
        <div className={s.confirm}>
          <Check size={22} />
          <div>
            <strong>Blastek m7foudha</strong>
            El chifour yestannek {HOLD_MINUTES} dkika. Ken bech tet3atel, ekleblou.
          </div>
        </div>
      )}

      {reserved ? (
        <button
          type="button"
          className={cx(s.btn, s.btnGhost, s.btnBlock)}
          onClick={() => {
            cancelReservation(d.id)
            setToast('Blastek tna77at')
          }}
        >
          Batel el réservation
        </button>
      ) : (
        <button
          type="button"
          className={cx(s.btn, s.btnPrimary, s.btnBlock)}
          disabled={left <= 0}
          onClick={() => {
            reserve(d.id)
            setToast('Mrigel, blastek m7foudha')
          }}
        >
          {left <= 0 ? 'Complet' : `Hezli blassa · ${formatPrice(d.price)} DT`}
        </button>
      )}
      <p className={s.demoNote}>Tkhalles lel chifour fel louage, kima dima.</p>

      {toast && (
        <Toast onDone={hideToast}>
          <Check size={16} /> {toast}
        </Toast>
      )}
    </Sheet>
  )
}
