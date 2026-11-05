'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { ArrowRight, BadgeCheck, MapPin, Search, Star, SteeringWheel, X } from './icons'
import { type Departure, formatClock, formatIn, formatPrice } from '../_lib/data'
import { useBlassa } from '../_lib/store'
import s from '../louage.module.css'

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

export function Logo() {
  return (
    <Link href="/louage" className={s.logo} aria-label="Blassa, accueil">
      <span className={s.logoWord}>
        blassa<span className={s.logoDot} />
      </span>
      <span className={s.logoAr} lang="ar">بلاصة</span>
    </Link>
  )
}

/** Tunisian plate, stored as "245 TU 8530", drawn as "8530 تونس 245". */
export function Plate({ value, large }: { value: string; large?: boolean }) {
  const [left, , right] = value.split(' ')
  return (
    <span className={cx(s.plate, large && s.plateLg)} dir="ltr" aria-label={`Plaque ${value}`}>
      <span>{right}</span>
      <span className={s.plateAr} lang="ar" dir="rtl">تونس</span>
      <span>{left}</span>
    </span>
  )
}

export function Seats({ total, filled, mine = 0, large }: { total: number; filled: number; mine?: number; large?: boolean }) {
  return (
    <div className={cx(s.seats, large && s.seatsLg)} role="img" aria-label={`${filled} men ${total} blayes ma3mrin`}>
      {Array.from({ length: total }, (_, i) => {
        const taken = i < filled
        const isMine = taken && i >= filled - mine
        return <span key={i} className={cx(s.seat, taken && s.seatTaken, isMine && s.seatMine)} />
      })}
    </div>
  )
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
  return <span className={s.avatar} aria-hidden>{initials}</span>
}

export function StatusPill({ d, now }: { d: Departure; now: number }) {
  if (d.status === 'full') return <span className={cx(s.pill, s.pillInk)}>Complet</span>
  if (d.departAt) return <span className={cx(s.pill, s.pillAmber)}>{formatClock(d.departAt)} · {formatIn(d.departAt, now)}</span>
  return (
    <span className={cx(s.pill, s.pillGreen)}>
      Yemchi ki yo3mer
    </span>
  )
}

export function seatsLeftLabel(d: Departure) {
  const left = d.seats - d.filled
  if (left <= 0) return 'Ma ba9a 7atta blassa'
  if (left === 1) return 'Ba9at blassa wa7da!'
  return `Ba9i ${left} blayes`
}

export function DepartureCard({ d, onOpen, index = 0 }: { d: Departure; onOpen: () => void; index?: number }) {
  const { now, isReserved } = useBlassa()
  const left = d.seats - d.filled
  const mine = isReserved(d.id) ? 1 : 0
  return (
    <button
      type="button"
      className={cx(s.card, d.status === 'full' && s.cardFull)}
      onClick={onOpen}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <span className={cx(s.cardStripe, d.kind === 'regional' && s.cardStripeBlue)} aria-hidden />
      <div className={s.cardTop}>
        <div style={{ minWidth: 0 }}>
          <div className={cx(s.route, s.display)}>
            <span className={s.routeCity}>{d.from}</span>
            <ArrowRight size={18} className={s.routeArrow} />
            <span className={s.routeCity}>{d.to}</span>
          </div>
          <div className={s.station}>
            <MapPin size={13} /> {d.station}
          </div>
        </div>
        <div className={s.price}>
          {formatPrice(d.price)}
          <span className={s.priceUnit}>DT</span>
          <span className={s.priceNote}>lel blassa</span>
        </div>
      </div>

      <div className={s.cardMid}>
        <Seats total={d.seats} filled={d.filled} mine={mine} />
        <span className={cx(s.left, left <= 2 && left > 0 && s.leftLow)}>{seatsLeftLabel(d)}</span>
      </div>

      <div className={s.cardFoot}>
        <div className={s.driver}>
          <Avatar name={d.driver.name} />
          <div style={{ minWidth: 0 }}>
            <div className={s.driverName}>{d.driver.name}</div>
            <div className={s.driverMeta}>
              <Star size={12} className={s.star} /> {d.driver.rating.toFixed(1)}
              {mine ? <span className={cx(s.pill, s.pillRed)} style={{ marginLeft: 6, padding: '1px 7px' }}>Blastek</span> : null}
            </div>
          </div>
        </div>
        <StatusPill d={d} now={now} />
      </div>
    </button>
  )
}

export function Sheet({ onClose, children, label }: { onClose: () => void; children: React.ReactNode; label: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <div className={s.sheet} role="dialog" aria-modal="true" aria-label={label}>
        <div className={s.handle} />
        <button type="button" className={s.sheetClose} onClick={onClose} aria-label="Sakker">
          <X size={18} />
        </button>
        {children}
      </div>
    </>
  )
}

export function Toast({ children, onDone }: { children: React.ReactNode; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className={s.toast} role="status">
      {children}
    </div>
  )
}

const TABS = [
  { href: '/louage', label: 'Rkoub', icon: Search },
  { href: '/louage/chauffeur', label: 'Chifour', icon: SteeringWheel },
  { href: '/louage/abonnement', label: 'Abonnement', icon: BadgeCheck },
]

export function TabBar() {
  const path = usePathname()
  return (
    <nav className={s.tabbar} aria-label="Navigation">
      {TABS.map(({ href, label, icon: Icon }) => {
        const on = path === href
        return (
          <Link key={href} href={href} className={cx(s.tab, on && s.tabOn)} aria-current={on ? 'page' : undefined}>
            <Icon size={20} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
