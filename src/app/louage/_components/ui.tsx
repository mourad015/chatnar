'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Car, House, Star, User, Users, Van, X } from './icons'
import { type Departure, formatClock, formatIn, formatPrice } from '../_lib/data'
import { useBlassa } from '../_lib/store'
import { BlassaMark, Wordmark } from './brand'
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
      <BlassaMark size={34} />
      <Wordmark size={22} />
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
  const sheetRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)

  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
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

  // Drag down to dismiss. The sheet follows the finger through inline styles
  // only (no re-renders), so nothing restarts mid-gesture.
  useEffect(() => {
    const el = sheetRef.current
    if (!el) return
    let startY = 0
    let lastY = 0
    let lastT = 0
    let velocity = 0
    let dragging = false

    const move = (dy: number) => {
      const y = dy > 0 ? dy : -Math.sqrt(-dy) * 2 // rubber band upwards
      el.style.transition = 'none'
      el.style.transform = `translateY(${y}px)`
      if (backdropRef.current) backdropRef.current.style.opacity = String(1 - Math.min(1, Math.max(0, dy) / 500))
    }
    const release = (dy: number) => {
      const h = el.offsetHeight || 600
      if (dy > h * 0.25 || (velocity > 0.45 && dy > 20)) {
        el.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
        el.style.transform = 'translateY(105%)'
        if (backdropRef.current) backdropRef.current.style.opacity = '0'
        close()
      } else {
        el.style.transition = 'transform 0.6s var(--spring)'
        el.style.transform = ''
        if (backdropRef.current) backdropRef.current.style.opacity = ''
      }
    }
    const begin = (y: number, ts: number) => {
      startY = lastY = y
      lastT = ts
      velocity = 0
      dragging = false
    }
    const track = (y: number, ts: number) => {
      velocity = (y - lastY) / Math.max(1, ts - lastT)
      lastY = y
      lastT = ts
    }

    // Touch: start dragging only when the sheet is scrolled to the top and
    // the finger moves down; otherwise the content scrolls normally.
    const onTouchStart = (e: TouchEvent) => {
      if (closingRef.current) return
      begin(e.touches[0].clientY, e.timeStamp)
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY
      if (!dragging) {
        if (el.scrollTop > 0 || y - startY < 8) return
        dragging = true
        startY = y
      }
      e.preventDefault()
      track(y, e.timeStamp)
      move(y - startY)
    }
    const onTouchEnd = () => {
      if (!dragging) return
      dragging = false
      release(lastY - startY)
    }

    // Mouse: drag from the grabber.
    const grabber = el.querySelector<HTMLElement>('[data-grabber]')
    const onMouseDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || closingRef.current) return
      begin(e.clientY, e.timeStamp)
      dragging = true
      const onMoveM = (ev: PointerEvent) => {
        track(ev.clientY, ev.timeStamp)
        move(ev.clientY - startY)
      }
      const onUpM = () => {
        window.removeEventListener('pointermove', onMoveM)
        window.removeEventListener('pointerup', onUpM)
        dragging = false
        release(lastY - startY)
      }
      window.addEventListener('pointermove', onMoveM)
      window.addEventListener('pointerup', onUpM)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    grabber?.addEventListener('pointerdown', onMouseDown)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
      grabber?.removeEventListener('pointerdown', onMouseDown)
    }
  }, [close, root])

  const sheet = (
    <>
      <div ref={backdropRef} className={cx(s.backdrop, closing && s.backdropClosing)} onClick={close} />
      <div ref={sheetRef} className={cx(s.sheet, closing && s.sheetClosing)} role="dialog" aria-modal="true" aria-label={label}>
        <div className={s.grabber} data-grabber aria-hidden>
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
  { href: '/louage', label: 'Accueil', icon: House },
  { href: '/louage/trajets', label: 'Trajets', icon: Car },
  { href: '/louage/favoris', label: 'Favoris', icon: Star },
  { href: '/louage/profil', label: 'Profil', icon: User },
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
