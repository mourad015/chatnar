// Static data for the Blassa louage prototype: cities, stations, prices, plans.

export type LouageKind = 'interurbain' | 'regional'

export type Departure = {
  id: string
  from: string
  to: string
  station: string
  price: number // in TND
  seats: number // a louage carries 8 passengers
  filled: number
  /** null = leaves when full ("ki y3abi"), otherwise a timestamp */
  departAt: number | null
  driver: { name: string; phone: string; plate: string; rating: number; trips: number }
  kind: LouageKind
  mine?: boolean // posted by the driver using this device
  status: 'open' | 'full' | 'gone'
  updatedAt: number
  /** Who sits where: 'f' woman, 'm' man, 'me' this rider, null free. Index = seat number - 1. */
  seatMap?: SeatOcc[]
}

export type SeatOcc = 'f' | 'm' | 'me' | null

/**
 * Louage seen from above (8 passengers). Row 1: driver + 2 front seats,
 * rows 2 and 3: three seats each. Indexes match seatMap.
 */
export const SEAT_ROWS: (number | 'driver')[][] = [
  ['driver', 0, 1],
  [2, 3, 4],
  [5, 6, 7],
]

export function seatLabel(i: number) {
  if (i <= 1) return i === 0 ? 'Gouddem, wost' : 'Gouddem, chobbek'
  const inRow = (i - 2) % 3
  return inRow === 1 ? 'Wost' : 'Chobbek'
}

export function makeSeatMap(filled: number, seats = 8): SeatOcc[] {
  const map: SeatOcc[] = Array(seats).fill(null)
  const order = Array.from({ length: seats }, (_, i) => i).sort(() => Math.random() - 0.5)
  for (let k = 0; k < Math.min(filled, seats); k++) map[order[k]] = Math.random() < 0.45 ? 'f' : 'm'
  return map
}

/** Seats where every taken neighbour in the same row is a woman (and at least one is). */
export function seatsNextToWomen(map: SeatOcc[]): Set<number> {
  const out = new Set<number>()
  for (const row of SEAT_ROWS) {
    const idx = row.filter((x): x is number => x !== 'driver')
    for (const i of idx) {
      if (map[i]) continue
      const pos = idx.indexOf(i)
      const nb = [idx[pos - 1], idx[pos + 1]].filter((x) => x !== undefined).map((x) => map[x])
      const taken = nb.filter(Boolean)
      if (taken.length && taken.every((o) => o === 'f')) out.add(i)
    }
  }
  return out
}

// ---------- parcels ----------

export type ParcelSize = 'S' | 'M' | 'L'
export const PARCEL_SIZES: { id: ParcelSize; name: string; hint: string; price: number }[] = [
  { id: 'S', name: 'Sghir', hint: 'Enveloppe, papiers, clés', price: 5 },
  { id: 'M', name: 'Wost', hint: 'Sac, boîte à chaussures', price: 8 },
  { id: 'L', name: 'Kbir', hint: 'Valise, carton', price: 12 },
]

export type Parcel = {
  id: string
  code: string // tracking code shown to the sender
  pin: string // 4 digits the recipient gives the driver
  from: string
  to: string
  size: ParcelSize
  price: number
  recipient: { name: string; phone: string }
  departureId: string
  driverName: string
  plate: string
  createdAt: number
  deliveredAt?: number
}

export type DriverProfile = {
  name: string
  phone: string
  plate: string
  kind: LouageKind
}

export type PlanId = 'month' | 'quarter' | 'year'

export type Subscription = {
  plan: PlanId
  method: PayMethod
  startedAt: number
  until: number
  trial: boolean
}

export type PayMethod = 'flouci' | 'd17' | 'card'

export const PLANS: {
  id: PlanId
  name: string
  months: number
  price: number
  perMonth: number
  note: string
  best?: boolean
}[] = [
  { id: 'month', name: 'Chhar', months: 1, price: 25, perMonth: 25, note: 'Bla engagement' },
  { id: 'quarter', name: '3 chhour', months: 3, price: 60, perMonth: 20, note: 'Wafer 15 DT', best: true },
  { id: 'year', name: '3am kemel', months: 12, price: 200, perMonth: 16.7, note: 'Wafer 100 DT' },
]

export const PAY_METHODS: { id: PayMethod; name: string; hint: string }[] = [
  { id: 'flouci', name: 'Flouci', hint: 'Mel téléphone, f thanya' },
  { id: 'd17', name: 'D17', hint: 'La Poste Tunisienne' },
  { id: 'card', name: 'Carte bancaire', hint: 'Visa · Mastercard · e-Dinar' },
]

export const CITIES = [
  'Tunis', 'Sousse', 'Sfax', 'Monastir', 'Mahdia', 'Nabeul', 'Hammamet', 'Bizerte',
  'Kairouan', 'Gabès', 'Djerba', 'Médenine', 'Gafsa', 'Tozeur', 'Béja', 'Jendouba',
  'Le Kef', 'Kasserine', 'Zaghouan', 'Siliana', 'Tataouine', 'Kébili',
] as const

const SOUTH_OF_TUNIS = new Set([
  'Sousse', 'Sfax', 'Monastir', 'Mahdia', 'Nabeul', 'Hammamet', 'Kairouan', 'Gabès',
  'Djerba', 'Médenine', 'Gafsa', 'Tozeur', 'Kasserine', 'Zaghouan', 'Tataouine', 'Kébili',
])

/** The louage station a trip leaves from. Tunis has two big ones. */
export function stationFor(from: string, to: string): string {
  if (from === 'Tunis') return SOUTH_OF_TUNIS.has(to) ? 'Station Moncef Bey' : 'Station Bab Saadoun'
  if (from === 'Djerba') return 'Station Houmt Souk'
  return `Station louage ${from}`
}

// Indicative fares from Tunis, in TND. Drivers set their own price.
const FROM_TUNIS: Record<string, number> = {
  Sousse: 13, Sfax: 24, Monastir: 15, Mahdia: 17, Nabeul: 7.5, Hammamet: 7, Bizerte: 6.5,
  Kairouan: 14, 'Gabès': 33, Djerba: 42, 'Médenine': 38, Gafsa: 30, Tozeur: 38, 'Béja': 8.5,
  Jendouba: 12.5, 'Le Kef': 14.5, Kasserine: 22, Zaghouan: 5, Siliana: 11, Tataouine: 44, 'Kébili': 40,
}

export function suggestedPrice(from: string, to: string): number {
  if (from === to) return 0
  if (from === 'Tunis') return FROM_TUNIS[to] ?? 15
  if (to === 'Tunis') return FROM_TUNIS[from] ?? 15
  const a = FROM_TUNIS[from] ?? 15
  const b = FROM_TUNIS[to] ?? 15
  return Math.max(4, Math.round(Math.abs(a - b) * 2) / 2 + 3)
}

export function kindFor(from: string, to: string): LouageKind {
  const near = new Set(['Tunis', 'Zaghouan', 'Bizerte', 'Nabeul', 'Hammamet'])
  return near.has(from) && near.has(to) ? 'regional' : 'interurbain'
}

const FIRST = ['Hamdi', 'Sami', 'Khaled', 'Mounir', 'Nizar', 'Fethi', 'Walid', 'Anis', 'Ridha', 'Lotfi', 'Bechir', 'Slim', 'Amel', 'Imed']
const LAST = ['B.', 'T.', 'M.', 'K.', 'H.', 'J.', 'S.', 'Z.']

let counter = 0
export function uid(prefix = 'd') {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter}_${Math.random().toString(36).slice(2, 6)}`
}

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomPlate() {
  const left = 100 + Math.floor(Math.random() * 155) // series
  const right = 1000 + Math.floor(Math.random() * 9000)
  return `${left} TU ${right}`
}

const SEED_ROUTES: [string, string][] = [
  ['Tunis', 'Sousse'], ['Tunis', 'Sousse'], ['Tunis', 'Sfax'], ['Tunis', 'Nabeul'],
  ['Tunis', 'Bizerte'], ['Tunis', 'Kairouan'], ['Tunis', 'Monastir'], ['Tunis', 'Jendouba'],
  ['Tunis', 'Béja'], ['Tunis', 'Djerba'], ['Tunis', 'Le Kef'], ['Tunis', 'Mahdia'],
  ['Sousse', 'Tunis'], ['Sfax', 'Tunis'], ['Sousse', 'Sfax'], ['Nabeul', 'Tunis'],
]

export function makeRandomDeparture(route?: [string, string]): Departure {
  const [from, to] = route ?? pick(SEED_ROUTES)
  const leavesWhenFull = Math.random() < 0.6
  const filled = Math.floor(Math.random() * 7)
  const base = suggestedPrice(from, to)
  return {
    id: uid(),
    from,
    to,
    station: stationFor(from, to),
    price: base,
    seats: 8,
    filled,
    departAt: leavesWhenFull ? null : Date.now() + (10 + Math.floor(Math.random() * 100)) * 60_000,
    driver: {
      name: `${pick(FIRST)} ${pick(LAST)}`,
      phone: `+216 ${pick(['2', '5', '9'])}${Math.floor(1000000 + Math.random() * 8999999)}`,
      plate: randomPlate(),
      rating: Math.round((4.3 + Math.random() * 0.7) * 10) / 10,
      trips: 40 + Math.floor(Math.random() * 900),
    },
    kind: kindFor(from, to),
    status: 'open',
    updatedAt: Date.now(),
    seatMap: makeSeatMap(filled),
  }
}

export function seedDepartures(): Departure[] {
  return SEED_ROUTES.map((r) => makeRandomDeparture(r))
}

export const POPULAR = ['Sousse', 'Sfax', 'Nabeul', 'Bizerte', 'Monastir', 'Djerba', 'Kairouan']

// ---------- formatting ----------

export function formatPrice(n: number) {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1)
}

export function formatClock(ts: number) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** "f 12 dkika", "f 1h20" */
export function formatIn(ts: number, now: number) {
  const min = Math.round((ts - now) / 60_000)
  if (min <= 0) return 'taw'
  if (min < 60) return `f ${min} dkika`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `f ${h}h${String(m).padStart(2, '0')}` : `f ${h}h`
}
