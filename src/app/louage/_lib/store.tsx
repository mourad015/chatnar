'use client'

// Prototype store: everything lives in this phone's localStorage, so a driver
// and a rider can try the full flow on one device. Swap for Supabase later.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  type Departure,
  type DriverProfile,
  type PayMethod,
  type PlanId,
  type Parcel,
  type SeatOcc,
  type Subscription,
  PLANS,
  makeRandomDeparture,
  makeSeatMap,
  seedDepartures,
} from './data'

const KEY = 'blassa.v1'
const TRIAL_DAYS = 30
const HOLD_MINUTES = 15

type Reservation = { departureId: string; at: number; seat?: number }

export type Role = 'rider' | 'driver'
export type User = { phone: string; name: string; role: Role; joinedAt: number }

type State = {
  departures: Departure[]
  driver: DriverProfile | null
  subscription: Subscription | null
  usedTrial: boolean
  reservations: Reservation[]
  user?: User | null
  favorites?: string[] // "From|To"
  parcels?: Parcel[]
}

type Store = State & {
  ready: boolean
  now: number
  /** Reserve a seat; pass the seat index to pick it on the louage plan. */
  reserve: (id: string, seat?: number) => void
  mySeat: (id: string) => number | undefined
  sendParcel: (p: Omit<Parcel, 'id' | 'code' | 'pin' | 'createdAt'>) => Parcel
  confirmParcel: (id: string, pin: string) => boolean
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
  login: (u: Omit<User, 'joinedAt'>) => void
  logout: () => void
  setRole: (r: Role) => void
  isFavorite: (from: string, to: string) => boolean
  toggleFavorite: (from: string, to: string) => void
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

/** Keep filled, status and the seat plan consistent. */
function withMap(d: Departure, map: SeatOcc[], ts = Date.now()): Departure {
  const filled = map.filter(Boolean).length
  return { ...d, seatMap: map, filled, status: filled >= d.seats ? 'full' : 'open', updatedAt: ts }
}

function freeSeats(map: SeatOcc[]) {
  return map.map((o, i) => (o ? -1 : i)).filter((i) => i >= 0)
}

/** Drop finished trips and keep the board looking alive. */
function tidy(s: State, now: number): State {
  let departures = s.departures.map((d) =>
    d.seatMap && d.seatMap.length === d.seats ? d : { ...d, seatMap: makeSeatMap(d.filled, d.seats) },
  )
  departures = departures.filter((d) => {
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
              if (d.id !== target.id || !d.seatMap) return d
              const free = freeSeats(d.seatMap)
              if (!free.length) return d
              const map = [...d.seatMap]
              map[free[Math.floor(Math.random() * free.length)]] = Math.random() < 0.45 ? 'f' : 'm'
              return withMap(d, map, ts)
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
    const s: State = state ?? { departures: [], driver: null, subscription: null, usedTrial: false, reservations: [], user: null }
    const isSubscribed = !!s.subscription && s.subscription.until > now
    return {
      ...s,
      ready: !!state,
      now,
      isSubscribed,
      isReserved: (id) => s.reservations.some((r) => r.departureId === id),
      mySeat: (id) => s.reservations.find((r) => r.departureId === id)?.seat,
      reserve: (id, seat) =>
        update((st) => {
          if (st.reservations.some((r) => r.departureId === id)) return st
          const d = st.departures.find((x) => x.id === id)
          if (!d?.seatMap) return st
          const free = freeSeats(d.seatMap)
          const chosen = seat !== undefined && free.includes(seat) ? seat : free[0]
          if (chosen === undefined) return st
          const map = [...d.seatMap]
          map[chosen] = 'me'
          return {
            ...st,
            reservations: [...st.reservations, { departureId: id, at: Date.now(), seat: chosen }],
            departures: st.departures.map((x) => (x.id === id ? withMap(x, map) : x)),
          }
        }),
      cancelReservation: (id) =>
        update((st) => ({
          ...st,
          reservations: st.reservations.filter((r) => r.departureId !== id),
          departures: st.departures.map((x) =>
            x.id === id && x.seatMap ? withMap(x, x.seatMap.map((o) => (o === 'me' ? null : o))) : x,
          ),
        })),
      sendParcel: (p) => {
        const parcel: Parcel = {
          ...p,
          id: `p_${Date.now().toString(36)}`,
          code: `BL-${String(Math.floor(1000 + Math.random() * 9000))}`,
          pin: String(Math.floor(1000 + Math.random() * 9000)),
          createdAt: Date.now(),
        }
        update((st) => ({ ...st, parcels: [parcel, ...(st.parcels ?? [])] }))
        return parcel
      },
      confirmParcel: (id, pin) => {
        const parcel = (s.parcels ?? []).find((x) => x.id === id)
        if (!parcel || parcel.pin !== pin) return false
        update((st) => ({
          ...st,
          parcels: (st.parcels ?? []).map((x) => (x.id === id ? { ...x, deliveredAt: Date.now() } : x)),
        }))
        return true
      },
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
            seatMap: makeSeatMap(d.filled, d.seats),
            driver: { name: st.driver.name, phone: st.driver.phone, plate: st.driver.plate, rating: 5, trips: 0 },
          }
          return { ...st, departures: [dep, ...st.departures] }
        }),
      setFilled: (id, filled) =>
        update((st) => ({
          ...st,
          departures: st.departures.map((x) => {
            if (x.id !== id) return x
            const map = [...(x.seatMap ?? makeSeatMap(x.filled, x.seats))]
            let count = map.filter(Boolean).length
            const target = Math.max(0, Math.min(x.seats, filled))
            // Boarding fills the next free seat; getting off frees the last taken one (never a rider's booking).
            while (count < target) {
              map[freeSeats(map)[0]] = 'm'
              count++
            }
            for (let i = map.length - 1; i >= 0 && count > target; i--) {
              if (map[i] && map[i] !== 'me') {
                map[i] = null
                count--
              }
            }
            return withMap(x, map)
          }),
        })),
      markGone: (id) => update((st) => ({ ...st, departures: st.departures.filter((x) => x.id !== id) })),
      resetDemo: () => setState(freshState()),
      login: (u) =>
        update((st) => ({ ...st, user: { ...u, joinedAt: Date.now() } })),
      logout: () => update((st) => ({ ...st, user: null })),
      isFavorite: (from, to) => (s.favorites ?? []).includes(`${from}|${to}`),
      toggleFavorite: (from, to) =>
        update((st) => {
          const key = `${from}|${to}`
          const fav = st.favorites ?? []
          return { ...st, favorites: fav.includes(key) ? fav.filter((f) => f !== key) : [...fav, key] }
        }),
      setRole: (role) => update((st) => (st.user ? { ...st, user: { ...st.user, role } } : st)),
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
