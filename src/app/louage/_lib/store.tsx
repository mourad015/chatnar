'use client'

// Prototype store: everything lives in this phone's localStorage, so a driver
// and a rider can try the full flow on one device. Swap for Supabase later.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  type Departure,
  type DriverProfile,
  type PayMethod,
  type PlanId,
  type Subscription,
  PLANS,
  makeRandomDeparture,
  seedDepartures,
} from './data'

const KEY = 'blassa.v1'
const TRIAL_DAYS = 30
const HOLD_MINUTES = 15

type Reservation = { departureId: string; at: number }

type State = {
  departures: Departure[]
  driver: DriverProfile | null
  subscription: Subscription | null
  usedTrial: boolean
  reservations: Reservation[]
}

type Store = State & {
  ready: boolean
  now: number
  reserve: (id: string) => void
  cancelReservation: (id: string) => void
  isReserved: (id: string) => boolean
  saveDriver: (p: DriverProfile) => void
  subscribe: (plan: PlanId, method: PayMethod) => Subscription
  cancelSubscription: () => void
  isSubscribed: boolean
  addDeparture: (d: Omit<Departure, 'id' | 'status' | 'updatedAt' | 'mine' | 'driver' | 'kind'>) => void
  setFilled: (id: string, filled: number) => void
  markGone: (id: string) => void
  resetDemo: () => void
}

const Ctx = createContext<Store | null>(null)

function freshState(): State {
  return { departures: seedDepartures(), driver: null, subscription: null, usedTrial: false, reservations: [] }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return freshState()
    const s = JSON.parse(raw) as State
    if (!Array.isArray(s.departures)) return freshState()
    return s
  } catch {
    return freshState()
  }
}

/** Drop finished trips and keep the board looking alive. */
function tidy(s: State, now: number): State {
  let departures = s.departures.filter((d) => {
    if (d.status === 'gone') return false
    if (d.departAt && d.departAt < now - 5 * 60_000) return false
    if (d.status === 'full' && now - d.updatedAt > 3 * 60_000 && !d.mine) return false
    return true
  })
  const seeded = departures.filter((d) => !d.mine && d.status === 'open').length
  if (seeded < 10) departures = [...departures, ...Array.from({ length: 12 - seeded }, () => makeRandomDeparture())]
  const reservations = s.reservations.filter(
    (r) => now - r.at < HOLD_MINUTES * 60_000 && departures.some((d) => d.id === r.departureId),
  )
  return { ...s, departures, reservations }
}

export function BlassaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State | null>(null)
  const [now, setNow] = useState(() => Date.now())

  // Load once on the client. localStorage is not available during prerender.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage
    setState(tidy(load(), Date.now()))
  }, [])

  useEffect(() => {
    if (!state) return
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* private mode: keep working in memory */
    }
  }, [state])

  // Clock + simulated passengers boarding the other louages.
  useEffect(() => {
    const t = setInterval(() => {
      const ts = Date.now()
      setNow(ts)
      setState((s) => {
        if (!s) return s
        const open = s.departures.filter((d) => !d.mine && d.status === 'open')
        if (open.length && Math.random() < 0.7) {
          const target = open[Math.floor(Math.random() * open.length)]
          s = {
            ...s,
            departures: s.departures.map((d) => {
              if (d.id !== target.id) return d
              const filled = Math.min(d.seats, d.filled + 1)
              return { ...d, filled, status: filled >= d.seats ? 'full' : 'open', updatedAt: ts }
            }),
          }
        }
        return tidy(s, ts)
      })
    }, 12_000)
    return () => clearInterval(t)
  }, [])

  const update = useCallback((fn: (s: State) => State) => {
    setState((s) => (s ? fn(s) : s))
  }, [])

  const store = useMemo<Store>(() => {
    const s = state ?? { departures: [], driver: null, subscription: null, usedTrial: false, reservations: [] }
    const isSubscribed = !!s.subscription && s.subscription.until > now
    return {
      ...s,
      ready: !!state,
      now,
      isSubscribed,
      isReserved: (id) => s.reservations.some((r) => r.departureId === id),
      reserve: (id) =>
        update((st) => {
          if (st.reservations.some((r) => r.departureId === id)) return st
          const d = st.departures.find((x) => x.id === id)
          if (!d || d.filled >= d.seats) return st
          return {
            ...st,
            reservations: [...st.reservations, { departureId: id, at: Date.now() }],
            departures: st.departures.map((x) =>
              x.id === id
                ? { ...x, filled: x.filled + 1, status: x.filled + 1 >= x.seats ? 'full' : 'open', updatedAt: Date.now() }
                : x,
            ),
          }
        }),
      cancelReservation: (id) =>
        update((st) => ({
          ...st,
          reservations: st.reservations.filter((r) => r.departureId !== id),
          departures: st.departures.map((x) =>
            x.id === id ? { ...x, filled: Math.max(0, x.filled - 1), status: 'open', updatedAt: Date.now() } : x,
          ),
        })),
      saveDriver: (p) => update((st) => ({ ...st, driver: p })),
      subscribe: (planId, method) => {
        const plan = PLANS.find((p) => p.id === planId)!
        const start = Date.now()
        const trial = !s.usedTrial
        // The free month is added on top of the paid period.
        const days = plan.months * 30 + (trial ? TRIAL_DAYS : 0)
        const sub: Subscription = { plan: planId, method, startedAt: start, until: start + days * 86_400_000, trial }
        update((st) => ({ ...st, subscription: sub, usedTrial: true }))
        return sub
      },
      cancelSubscription: () => update((st) => ({ ...st, subscription: null })),
      addDeparture: (d) =>
        update((st) => {
          if (!st.driver) return st
          const dep: Departure = {
            ...d,
            id: `mine_${Date.now().toString(36)}`,
            mine: true,
            kind: st.driver.kind,
            status: d.filled >= d.seats ? 'full' : 'open',
            updatedAt: Date.now(),
            driver: { name: st.driver.name, phone: st.driver.phone, plate: st.driver.plate, rating: 5, trips: 0 },
          }
          return { ...st, departures: [dep, ...st.departures] }
        }),
      setFilled: (id, filled) =>
        update((st) => ({
          ...st,
          departures: st.departures.map((x) =>
            x.id === id
              ? { ...x, filled: Math.max(0, Math.min(x.seats, filled)), status: filled >= x.seats ? 'full' : 'open', updatedAt: Date.now() }
              : x,
          ),
        })),
      markGone: (id) => update((st) => ({ ...st, departures: st.departures.filter((x) => x.id !== id) })),
      resetDemo: () => setState(freshState()),
    }
  }, [state, now, update])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useBlassa() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useBlassa must be used inside BlassaProvider')
  return s
}

export { HOLD_MINUTES, TRIAL_DAYS }
