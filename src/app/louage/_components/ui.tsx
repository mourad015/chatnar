'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BadgeCheck, Search, Star, SteeringWheel, Users, Van, X } from './icons'
import { type Departure, formatClock, formatIn, formatPrice } from '../_lib/data'
import { useBlassa } from '../_lib/store'
import s from '../louage.module.css'

/** Light haptic tick where the phone supports it (Android). */
export function tap(ms = 8) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* not supported */
  }
}

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

export function Logo() {
  return (
    <Link href="/louage" className={s.logo} aria-label="Blassa, accueil">
      <span className={s.logoWord}>
        Blassa<span className={s.logoDot} />
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
    <div className={cx(s.seats, large && s.seatsLg)} role="img" aria-label={`${filled} men ${total} blayes m3abyin`}>
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
  return <span className={cx(s.pill, s.pillGreen)}>Yemchi ki y3abi</span>
}

export function seatsLeftLabel(d: Departure) {
  const left = d.seats - d.filled
  if (left <= 0) return 'Ma ba9a 7atta blassa'
  if (left === 1) return 'Ba9at blassa wa7da!'
  return `Ba9i ${left} blayes`
}

/** One louage, laid out like a ride option: van, route + details, price. */
export function OptionRow({ d, selected, onSelect, index = 0 }: { d: Departure; selected: boolean; onSelect: () => void; index?: number }) {
  const { now, isReserved } = useBlassa()
  const left = d.seats - d.filled
  const mine = isReserved(d.id)
  return (
    <button
      type="button"
      className={cx(s.opt, selected && s.optOn, d.status === 'full' && s.optFull)}
      onClick={() => {
        tap()
        onSelect()
      }}
      aria-pressed={selected}
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
    >
      <span className={s.optVan}>
        <Van width={60} stripe={d.kind === 'regional' ? 'blue' : 'red'} />
      </span>
      <span className={s.optBody}>
        <span className={s.optTitle}>
          {d.to}
          <span className={s.optSeats}>
            <Users size={13} /> {left}
          </span>
        </span>
        <span className={s.optSub} style={{ display: 'block' }}>
          {d.station.replace('Station ', '')} · <Star size={11} className={s.star} style={{ verticalAlign: '-1px' }} /> {d.driver.rating.toFixed(1)} {d.driver.name}
        </span>
        <span className={s.optMeta}>
          <StatusPill d={d} now={now} />
          {mine ? <span className={cx(s.pill, s.pillRed)}>Blastek</span> : left > 0 && left <= 2 ? <span className={cx(s.pill, s.pillRed)}>{seatsLeftLabel(d)}</span> : null}
        </span>
      </span>
      <span className={s.optPrice}>
        {formatPrice(d.price)} DT
        <small>lel blassa</small>
      </span>
    </button>
  )
}

export function Sheet({ onClose, children, label }: { onClose: () => void; children: React.ReactNode; label: string }) {
  // Render at the app root so a sheet opened from the sticky top bar still
  // sits above the tab bar (the top bar has its own stacking context).
  const [root, setRoot] = useState<HTMLElement | null>(null)
  const [closing, setClosing] = useState(false)
  const [drag, setDrag] = useState<{ y: number; active: boolean } | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const start = useRef<{ y: number; t: number; lastY: number; lastT: number } | null>(null)

  const close = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 300)
  }, [onClose])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal target only exists after mount
    setRoot(document.querySelector<HTMLElement>('[data-blassa-root]'))
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [close])

  // Drag down to dismiss, from the grabber or anywhere while scrolled to top.
  const onPointerDown = (e: React.PointerEvent) => {
    const el = sheetRef.current
    if (!el || el.scrollTop > 0 || closing) return
    if ((e.target as HTMLElement).closest('button, a, input, select, label')) return
    start.current = { y: e.clientY, t: e.timeStamp, lastY: e.clientY, lastT: e.timeStamp }
    el.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return
    const dy = e.clientY - start.current.y
    // Rubber band when pulling up.
    const y = dy > 0 ? dy : -Math.sqrt(-dy) * 2
    start.current.lastY = e.clientY
    start.current.lastT = e.timeStamp
    setDrag({ y, active: true })
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return
    const dy = e.clientY - start.current.y
    const dt = Math.max(1, e.timeStamp - start.current.t)
    const velocity = dy / dt // px per ms
    start.current = null
    const h = sheetRef.current?.offsetHeight ?? 600
    if (dy > h * 0.3 || (velocity > 0.5 && dy > 30)) {
      setDrag(null)
      close()
    } else {
      // Spring back, then drop the inline transform so fixed children
      // (toasts) are positioned against the screen again.
      setDrag({ y: 0, active: false })
      setTimeout(() => setDrag(null), 650)
    }
  }

  const progress = drag && drag.y > 0 ? Math.min(1, drag.y / 400) : 0
  const sheet = (
    <>
      <div className={cx(s.backdrop, closing && s.backdropClosing)} style={progress ? { opacity: 1 - progress } : undefined} onClick={close} />
      <div
        ref={sheetRef}
        className={cx(s.sheet, drag?.active && s.sheetDragging, drag && !drag.active && s.sheetSettle, closing && s.sheetClosing)}
        style={drag ? { transform: `translateY(${drag.y}px)` } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className={s.grabber} aria-hidden>
          <span />
        </div>
        <button type="button" className={s.sheetClose} onClick={close} aria-label="Sakker">
          <X size={18} />
        </button>
        {children}
      </div>
    </>
  )
  return root ? createPortal(sheet, root) : null
}

export function Toast({ children, onDone }: { children: React.ReactNode; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const a = setTimeout(() => setLeaving(true), 2300)
    const b = setTimeout(onDone, 2650)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [onDone])
  return (
    <div className={cx(s.toast, leaving && s.toastOut)} role="status">
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
          <Link key={href} href={href} className={cx(s.tab, on && s.tabOn)} aria-current={on ? 'page' : undefined} onClick={() => tap()}>
            <Icon size={22} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
