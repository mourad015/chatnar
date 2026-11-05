'use client'

// Rider screens from the brand board: results list, louage card, detail sheet.

import { useCallback, useMemo, useState } from 'react'
import {
  Armchair,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  Copy,
  Heart,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  Van,
} from './icons'
import { Avatar, Plate, Sheet, Toast, cx, tap } from './ui'
import { FillBar, SeatPicker } from './seats'
import { type Departure, formatClock, formatIn, formatPrice, seatLabel } from '../_lib/data'
import { HOLD_MINUTES, useBlassa } from '../_lib/store'
import s from '../louage.module.css'

export function statusOf(d: Departure) {
  const left = d.seats - d.filled
  if (left <= 0) return { label: 'Complet', cls: s.dotGrey }
  if (left <= 2) return { label: 'Presque complet', cls: s.dotAmber }
  return { label: 'Disponible', cls: s.dotGreen }
}

export function estimateOf(d: Departure, now: number) {
  if (d.departAt) return `Départ ${formatClock(d.departAt)} · ${formatIn(d.departAt, now)}`
  const left = d.seats - d.filled
  if (left <= 0) return 'Départ imminent'
  const a = Math.max(5, left * 3)
  return `Départ estimé : ${a}–${a + 10} min`
}

export function StatusDot({ d }: { d: Departure }) {
  const st = statusOf(d)
  return (
    <span className={cx(s.dotPill, st.cls)}>
      <i /> {st.label}
    </span>
  )
}

const todayLabel = () =>
  `Aujourd'hui · ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`

type Filter = 'all' | 'full-leave' | 'timed'

export function Results({ from, to, onBack }: { from: string; to: string; onBack: () => void }) {
  const { departures, ready, now } = useBlassa()
  const [filter, setFilter] = useState<Filter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const close = useCallback(() => setOpenId(null), [])

  const list = useMemo(
    () =>
      departures
        .filter((d) => d.from === from && (!to || d.to === to))
        .filter((d) => (filter === 'timed' ? !!d.departAt : filter === 'full-leave' ? !d.departAt : true))
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === 'open' ? -1 : 1
          const score = (d: Departure) => (d.departAt ? d.departAt - now : (d.seats - d.filled) * 4 * 60_000)
          return score(a) - score(b)
        }),
    [departures, from, to, filter, now],
  )
  const open = departures.find((d) => d.id === openId) ?? null

  return (
    <>
      <div className={s.navHeader}>
        <button type="button" className={s.iconBtn} onClick={onBack} aria-label="Arja3">
          <ChevronLeft size={22} />
        </button>
        <div className={s.navTitle}>
          {from} → {to || 'Ay blassa'}
        </div>
        <button
          type="button"
          className={s.iconBtn}
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Filtres"
          aria-expanded={showFilters}
          style={showFilters ? { background: 'var(--ink)', color: 'var(--bg)' } : undefined}
        >
          <SlidersHorizontal size={19} />
        </button>
      </div>

      <div className={s.dateChip}>
        <CalendarDays size={18} /> {todayLabel()}
        <span className={s.muted} style={{ marginLeft: 'auto', fontWeight: 500, fontSize: 13 }}>
          {ready ? `${list.length} louage` : ''}
        </span>
      </div>

      {showFilters && (
        <div className={s.segment} style={{ margin: '-4px 0 14px' }}>
          {([
            ['all', 'Ay wa9t'],
            ['full-leave', 'Ki y3abi'],
            ['timed', 'B wa9t'],
          ] as [Filter, string][]).map(([k, label]) => (
            <button key={k} type="button" className={cx(s.segBtn, filter === k && s.segOn)} onClick={() => setFilter(k)}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div className={s.resList}>
        {!ready && [0, 1, 2].map((i) => <div key={i} className={s.skeleton} style={{ height: 170 }} />)}
        {ready && list.length === 0 && (
          <div className={s.empty}>
            <span className={s.emptyIcon}><Search size={22} /></span>
            <h3 className={cx(s.display, s.emptyTitle)}>Ma fama 7atta louage taw</h3>
            <p className={s.muted} style={{ fontSize: 14 }}>Jarreb destination okhra, wala erja3 ba3d chwaya.</p>
          </div>
        )}
        {list.map((d, i) => (
          <ResCard key={d.id} d={d} index={i} onOpen={() => setOpenId(d.id)} />
        ))}
      </div>

      {open && <DepartureSheet d={open} onClose={close} />}
    </>
  )
}

export function ResCard({ d, index = 0, onOpen }: { d: Departure; index?: number; onOpen: () => void }) {
  const { now, isFavorite, toggleFavorite, isReserved } = useBlassa()
  const left = d.seats - d.filled
  const fav = isFavorite(d.from, d.to)
  return (
    <article className={s.resCard} style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <div className={s.resThumb}>
        <Van width={86} stripe={d.kind === 'regional' ? 'blue' : 'red'} />
      </div>
      <div className={s.resInfo}>
        <div className={s.resTop}>
          <StatusDot d={d} />
          {isReserved(d.id) && <span className={cx(s.dotPill, s.dotRed)}>Blastek</span>}
        </div>
        <span className={s.resSeats}>
          <Users size={15} /> {left} {left === 1 ? 'place' : 'places'} · {d.to}
        </span>
        <span className={s.resPrice}>
          {formatPrice(d.price)}
          <small>DT</small>
        </span>
      </div>
      <div className={s.resEst}>
        <Clock size={14} /> {estimateOf(d, now)} · {d.station.replace('Station ', '')}
      </div>
      <div className={s.resActions}>
        <button
          type="button"
          className={cx(s.btn, s.btnOutline)}
          onClick={() => {
            tap()
            onOpen()
          }}
        >
          Voir le louage
        </button>
        <button
          type="button"
          className={cx(s.favBtn, fav && s.favOn)}
          onClick={() => {
            tap()
            toggleFavorite(d.from, d.to)
          }}
          aria-label={fav ? 'Na77i men el favoris' : 'Zid lel favoris'}
          aria-pressed={fav}
        >
          <Heart size={19} />
        </button>
      </div>
    </article>
  )
}

export function DepartureSheet({ d, onClose }: { d: Departure; onClose: () => void }) {
  const { now, reserve, cancelReservation, isReserved, mySeat } = useBlassa()
  const [toast, setToast] = useState<string | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const reserved = isReserved(d.id)
  const seatNow = reserved ? (mySeat(d.id) ?? null) : picked
  // A picked seat taken by someone else in the meantime is dropped.
  const pickedFree = picked !== null && !d.seatMap?.[picked]
  const left = d.seats - d.filled
  const st = statusOf(d)
  const hideToast = useCallback(() => setToast(null), [])

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(d.driver.phone)
      setToast('Numéro copié')
    } catch {
      setToast(d.driver.phone)
    }
  }

  return (
    <Sheet onClose={onClose} label={`${d.from} vers ${d.to}`}>
      <div className={s.detailHero}>
        <Van width={230} stripe={d.kind === 'regional' ? 'blue' : 'red'} />
      </div>

      <div className={s.detailCard}>
        <div className={s.detailTitle}>
          {d.from} → {d.to}
        </div>
        <div className={s.station}>
          <MapPin size={14} /> {d.station}
        </div>
        <div className={s.availRow}>
          <span className={s.availText} style={{ color: `var(${left <= 0 ? '--muted' : left <= 2 ? '--amber' : '--green'})` }}>
            <i /> {left > 0 ? `${left} ${left === 1 ? 'place disponible' : 'places disponibles'}` : st.label}
          </span>
          <span className={s.resPrice} style={{ fontSize: 26 }}>
            {formatPrice(d.price)}
            <small>DT</small>
            <span className={s.muted} style={{ display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: 0, textAlign: 'right' }}>/ place</span>
          </span>
        </div>
      </div>

      <div className={s.infoRows}>
        <div className={s.infoRow}>
          <Clock size={20} />
          <div>
            <b>{estimateOf(d, now)}</b>
            <span>{d.departAt ? 'Départ à heure fixe' : 'Le louage part dès qu’il est complet'}</span>
          </div>
        </div>
        <div className={s.infoRow}>
          <Armchair size={20} />
          <div>
            <b>{d.seats} places · {left} libres</b>
            <span>{seatNow !== null ? `Place ${seatNow + 1} · ${seatLabel(seatNow)}` : 'Choisissez votre place ci-dessous'}</span>
          </div>
        </div>
        <div className={s.infoRow}>
          <RefreshCw size={20} />
          <div>
            <b>Dernière mise à jour à {formatClock(d.updatedAt)}</b>
            <span>Mise à jour par le chauffeur</span>
          </div>
        </div>
      </div>

      <FillBar d={d} />

      <SeatPicker d={d} value={seatNow} onChange={setPicked} locked={reserved} />

      <div className={s.driverBox}>
        <div className={s.driver}>
          <Avatar name={d.driver.name} />
          <div>
            <div className={s.driverName}>{d.driver.name}</div>
            <div className={s.driverMeta}>
              <Star size={12} className={s.star} /> {d.driver.rating.toFixed(1)} · {d.driver.trips} trajets
            </div>
          </div>
        </div>
        <Plate value={d.driver.plate} />
      </div>

      <div className={s.phoneRow}>
        <span className={s.phoneNum}>{d.driver.phone}</span>
        <span style={{ display: 'flex', gap: 6 }}>
          <button type="button" className={cx(s.btn, s.btnGhost, s.btnSm)} style={{ background: 'var(--surface)' }} onClick={copyPhone} aria-label="Copier le numéro">
            <Copy size={16} />
          </button>
          <a className={cx(s.btn, s.btnGhost, s.btnSm)} style={{ background: 'var(--surface)' }} href={`tel:${d.driver.phone.replace(/\s/g, '')}`} aria-label="Appeler">
            <Phone size={16} />
          </a>
        </span>
      </div>

      {reserved && (
        <div className={s.confirm}>
          <Check size={22} />
          <div>
            <strong>Place {seatNow !== null ? seatNow + 1 : ''} réservée</strong>
            Le chauffeur vous attend {HOLD_MINUTES} min. En retard ? Appelez-le.
          </div>
        </div>
      )}

      {reserved ? (
        <button
          type="button"
          className={cx(s.btn, s.btnGhost, s.btnBlock)}
          onClick={() => {
            cancelReservation(d.id)
            setToast('Réservation annulée')
          }}
        >
          Annuler la réservation
        </button>
      ) : (
        <button
          type="button"
          className={cx(s.btn, s.btnPrimary, s.btnBlock, s.searchBtn)}
          disabled={left <= 0}
          onClick={() => {
            tap(14)
            reserve(d.id, pickedFree ? picked! : undefined)
            setToast('Place réservée')
          }}
        >
          {left <= 0 ? 'Complet' : pickedFree ? `Réserver la place ${picked! + 1}` : 'Réserver ma place'}
        </button>
      )}
      <p className={s.demoNote}>Vous payez le chauffeur dans le louage, comme d’habitude.</p>

      {toast && (
        <Toast onDone={hideToast}>
          <Check size={16} /> {toast}
        </Toast>
      )}
    </Sheet>
  )
}
