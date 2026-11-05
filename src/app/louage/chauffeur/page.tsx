'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { ArrowRight, Bell, Check, Minus, Plus, ShieldCheck, TrendingUp, Users, Van, Zap } from '../_components/icons'
import { AccountButton } from '../_components/auth'
import { Logo, Plate, Seats, StatusPill, Toast, cx, tap } from '../_components/ui'
import { CITIES, PLANS, formatPrice, kindFor, stationFor, suggestedPrice, type DriverProfile, type LouageKind } from '../_lib/data'
import { useBlassa } from '../_lib/store'
import s from '../louage.module.css'

export default function DriverPage() {
  const { ready, driver, isSubscribed } = useBlassa()

  return (
    <>
      <header className={s.topbar}>
        <Logo />
        <span className={s.topRight}>
          <span className={cx(s.pill, isSubscribed ? s.pillGreen : s.pillAmber)}>
            {isSubscribed ? 'Abonné' : 'Mode chifour'}
          </span>
          <AccountButton />
        </span>
      </header>

      {!ready && <div className={s.skeleton} style={{ height: 320 }} />}
      {ready && !driver && <Onboarding />}
      {ready && driver && !isSubscribed && <Paywall name={driver.name} />}
      {ready && driver && isSubscribed && <Dashboard />}
    </>
  )
}

/* ---------- 1. Driver profile ---------- */

function Onboarding() {
  const { saveDriver, user } = useBlassa()
  const [form, setForm] = useState<DriverProfile>({ name: user?.name ?? '', phone: user?.phone ?? '', plate: '', kind: 'interurbain' })
  const [series, setSeries] = useState('')
  const [num, setNum] = useState('')
  const valid = form.name.trim().length > 1 && form.phone.replace(/\D/g, '').length >= 8 && series && num.length >= 3

  const set = <K extends keyof DriverProfile>(k: K, v: DriverProfile[K]) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <>
      <div className={s.pageHead}>
        <p className={s.eyebrow}>T3abi el profil · 1/2</p>
        <h1 className={cx(s.display, s.pageTitle)}>Ahla bik, chifour.</h1>
        <p className={s.muted}>Zouz d9aye9 w el rokkab yetchoufouk fel appli.</p>
      </div>

      <form
        className={cx(s.panel, s.form)}
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          saveDriver({ ...form, name: form.name.trim(), plate: `${series} TU ${num}` })
        }}
      >
        <label className={s.label}>
          Esmek
          <input className={s.input} placeholder="Mathalan: Hamdi B." value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
        </label>
        <label className={s.label}>
          Numéro téléphone
          <input className={s.input} placeholder="+216 22 123 456" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
          <span className={s.hint}>El rokkab yeklbouk 3lih bech y7jzou.</span>
        </label>

        <div className={s.label}>
          Plaque
          <div className={s.grid2} style={{ gridTemplateColumns: '1.4fr auto 1fr', alignItems: 'center' }}>
            <input className={s.input} placeholder="8530" inputMode="numeric" maxLength={4} value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, ''))} aria-label="Numéro" />
            <span className={s.plateAr} lang="ar" style={{ fontSize: 16 }}>تونس</span>
            <input className={s.input} placeholder="245" inputMode="numeric" maxLength={3} value={series} onChange={(e) => setSeries(e.target.value.replace(/\D/g, ''))} aria-label="Série" />
          </div>
          {series && num && (
            <span style={{ marginTop: 4 }}>
              <Plate value={`${series} TU ${num}`} large />
            </span>
          )}
        </div>

        <div className={s.label}>
          Naw3 el louage
          <div className={s.choice}>
            {([
              ['interurbain', 'Interurbain', 'Khatt a7mar'],
              ['regional', 'Régional', 'Khatt azra9'],
            ] as [LouageKind, string, string][]).map(([k, label, sub]) => (
              <button key={k} type="button" className={cx(s.choiceBtn, form.kind === k && s.choiceOn)} onClick={() => set('kind', k)} aria-pressed={form.kind === k}>
                <span className={cx(s.swatch, k === 'regional' && s.swatchBlue)} />
                <span>
                  {label}
                  <span className={s.hint} style={{ display: 'block' }}>{sub}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className={cx(s.btn, s.btnInk, s.btnBlock)} disabled={!valid}>
          Kammel <ArrowRight size={18} />
        </button>
      </form>
    </>
  )
}

/* ---------- 2. Paywall ---------- */

function Paywall({ name }: { name: string }) {
  const { usedTrial, driver } = useBlassa()
  const cheapest = Math.min(...PLANS.map((p) => p.perMonth))
  return (
    <>
      <div className={s.pageHead}>
        <p className={s.eyebrow}>T3abi el profil · 2/2</p>
      </div>
      <section className={s.pitch}>
        <div className={s.pitchArt}>
          <Van width={190} stripe={driver?.kind === 'regional' ? 'blue' : 'red'} />
        </div>
        <div className={s.pitchInner}>
          <p className={s.eyebrow} style={{ color: 'var(--hero-muted)' }}>Ahla {name.split(' ')[0]}</p>
          <h1 className={cx(s.display, s.pitchTitle)}>
            3abbi el louage <em>asra3.</em>
          </h1>
          <p style={{ color: 'var(--hero-muted)', fontSize: 14.5 }}>
            El rokkab yetchoufou blayesek w soumek men darhom, w yjiwek toul.
          </p>
          <ul className={s.perks}>
            <li>
              <span className={s.perkIcon}><Zap size={16} /></span>
              <div><b>Départs bla 7seb</b><span>Zid kol trajet w kol départ, kol yom.</span></div>
            </li>
            <li>
              <span className={s.perkIcon}><Users size={16} /></span>
              <div><b>Rokkab y7jzou blayes</b><span>Yeklbouk direct, ma testannech fel station.</span></div>
            </li>
            <li>
              <span className={s.perkIcon}><TrendingUp size={16} /></span>
              <div><b>Rating w thi9a</b><span>Ta9yim w nombre trajet, bech el nes tethe9 fik.</span></div>
            </li>
          </ul>
          <Link href="/louage/abonnement" className={cx(s.btn, s.btnBlock)} style={{ background: 'var(--hero-ink)', color: 'var(--hero)' }}>
            {usedTrial ? `Abonni men ${formatPrice(cheapest)} DT/chhar` : 'Jarreb chhar b bleech'}
            <ArrowRight size={18} />
          </Link>
          <p style={{ marginTop: 10, textAlign: 'center', fontSize: 12.5, color: 'var(--hero-muted)' }}>
            Ba3d men {formatPrice(cheapest)} DT fel chhar · tbatel wa9t ma t7eb
          </p>
        </div>
      </section>
    </>
  )
}

/* ---------- 3. Dashboard ---------- */

function Dashboard() {
  const { driver, subscription, departures, now, addDeparture } = useBlassa()
  const [from, setFrom] = useState('Tunis')
  const [to, setTo] = useState('Sousse')
  const [price, setPrice] = useState(() => suggestedPrice('Tunis', 'Sousse'))
  const [filled, setFilled] = useState(0)
  const [mode, setMode] = useState<'full' | 'time'>('full')
  const [time, setTime] = useState(() => {
    const d = new Date(Date.now() + 60 * 60_000)
    return `${String(d.getHours()).padStart(2, '0')}:00`
  })
  const [toast, setToast] = useState<string | null>(null)
  const hideToast = useCallback(() => setToast(null), [])

  const mine = departures.filter((d) => d.mine)
  const plan = PLANS.find((p) => p.id === subscription?.plan)
  const daysLeft = subscription ? Math.max(0, Math.ceil((subscription.until - now) / 86_400_000)) : 0
  const totalDays = subscription ? Math.round((subscription.until - subscription.startedAt) / 86_400_000) : 1

  const changeRoute = (f: string, t: string) => {
    setFrom(f)
    setTo(t)
    setPrice(suggestedPrice(f, t))
  }

  const publish = () => {
    let departAt: number | null = null
    if (mode === 'time') {
      const [h, m] = time.split(':').map(Number)
      const d = new Date()
      d.setHours(h, m, 0, 0)
      if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1)
      departAt = d.getTime()
    }
    addDeparture({ from, to, station: stationFor(from, to), price, seats: 8, filled, departAt })
    setFilled(0)
    setToast(`${from} → ${to} tzed. El rokkab yetchoufouh taw.`)
  }

  return (
    <>
      <div className={s.pageHead}>
        <p className={s.eyebrow}>Tableau de bord</p>
        <h1 className={cx(s.display, s.pageTitle)}>Sa77a {driver!.name.split(' ')[0]}.</h1>
      </div>

      <section className={s.status}>
        <div className={s.statusTop}>
          <span className={s.eyebrow} style={{ color: 'var(--hero-muted)' }}>
            Abonnement {plan?.name}
          </span>
          <Plate value={driver!.plate} />
        </div>
        <div className={cx(s.display, s.statusBig)}>{daysLeft} jour ba9in</div>
        <div className={s.statusSub}>
          {subscription?.trial ? 'Fihom chhar b bleech · ' : ''}Yekmel {new Date(subscription!.until).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long' })}
        </div>
        <div className={s.meter}>
          <div className={s.meterFill} style={{ width: `${Math.max(4, (daysLeft / totalDays) * 100)}%` }} />
        </div>
      </section>

      <section className={s.panel}>
        <h2 className={cx(s.display, s.panelTitle)}>
          Zid départ
          <span className={cx(s.pill, driver!.kind === 'regional' ? s.pillBlue : s.pillRed)}>
            {driver!.kind === 'regional' ? 'Régional' : 'Interurbain'}
          </span>
        </h2>
        <div className={s.form}>
          <div className={s.grid2}>
            <label className={s.label}>
              Mnin
              <select className={s.input} value={from} onChange={(e) => changeRoute(e.target.value, e.target.value === to ? '' : to)}>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className={s.label}>
              Win
              <select className={s.input} value={to} onChange={(e) => changeRoute(from, e.target.value)}>
                <option value="" disabled>—</option>
                {CITIES.filter((c) => c !== from).map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>
          {to && (
            <p className={s.hint} style={{ marginTop: -6 }}>
              {stationFor(from, to)} · {kindFor(from, to) === 'regional' ? 'trajet régional' : 'trajet interurbain'}
            </p>
          )}

          <div className={s.grid2} style={{ gridTemplateColumns: '0.8fr 1.2fr' }}>
            <label className={s.label}>
              Soum (DT)
              <input
                className={s.input}
                type="number"
                inputMode="decimal"
                min={1}
                step={0.5}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </label>
            <div className={s.label}>
              Départ
              <div className={s.choice} style={{ gap: 6 }}>
                <button type="button" className={cx(s.choiceBtn, mode === 'full' && s.choiceOn)} style={{ justifyContent: 'center', padding: 8, fontSize: 13, whiteSpace: 'nowrap' }} onClick={() => setMode('full')} aria-pressed={mode === 'full'}>
                  Ki y3abi
                </button>
                <button type="button" className={cx(s.choiceBtn, mode === 'time' && s.choiceOn)} style={{ justifyContent: 'center', padding: 8, fontSize: 13, whiteSpace: 'nowrap' }} onClick={() => setMode('time')} aria-pressed={mode === 'time'}>
                  B wa9t
                </button>
              </div>
            </div>
          </div>
          {mode === 'time' && (
            <label className={s.label}>
              Wa9tech temchi?
              <input className={s.input} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
          )}

          <div className={s.label}>
            9addech men rakeb m3ak deja?
            <Stepper value={filled} max={7} onChange={setFilled} unit="rakeb" />
          </div>

          <button type="button" className={cx(s.btn, s.btnPrimary, s.btnBlock)} disabled={!to || !price || price <= 0} onClick={publish}>
            <Bell size={18} /> Nachar el départ
          </button>
        </div>
      </section>

      <div className={s.sectionHead} style={{ marginTop: 22 }}>
        <div>
          <p className={s.eyebrow}>Live</p>
          <h2 className={cx(s.display, s.sectionTitle)}>Départat mte3ek</h2>
        </div>
        <span className={s.muted} style={{ fontSize: 13 }}>{mine.length}</span>
      </div>

      {mine.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIcon}><ShieldCheck size={22} /></span>
          <h3 className={cx(s.display, s.emptyTitle)}>Mazelt ma nacharet chay</h3>
          <p className={s.muted} style={{ fontSize: 14 }}>Zid awel départ louta, w kol ma yerkeb 7ad, a3mel +1.</p>
        </div>
      ) : (
        mine.map((d) => <MyTrip key={d.id} id={d.id} />)
      )}

      <p className={s.demoNote} style={{ marginTop: 18 }}>
        Tnajem tchouf départat-ek fel onglet <Link href="/louage" style={{ color: 'inherit' }}>Rkoub</Link>, kima ychoufha el rakeb.
      </p>

      {toast && (
        <Toast onDone={hideToast}>
          <Check size={16} /> {toast}
        </Toast>
      )}
    </>
  )
}

function MyTrip({ id }: { id: string }) {
  const { departures, setFilled, markGone, now } = useBlassa()
  const d = departures.find((x) => x.id === id)
  if (!d) return null
  return (
    <article className={s.myTrip}>
      <span className={cx(s.cardStripe, d.kind === 'regional' && s.cardStripeBlue)} aria-hidden />
      <div className={s.myTripHead}>
        <div>
          <div className={cx(s.route, s.display)} style={{ fontSize: 21 }}>
            {d.from} <ArrowRight size={16} className={s.routeArrow} /> {d.to}
          </div>
          <div className={s.station}>{d.station} · {formatPrice(d.price)} DT</div>
        </div>
        <StatusPill d={d} now={now} />
      </div>
      <Seats total={d.seats} filled={d.filled} large />
      <div style={{ marginTop: 14 }}>
        <Stepper value={d.filled} max={d.seats} onChange={(v) => setFilled(d.id, v)} unit="m3abyin" big />
      </div>
      <button type="button" className={cx(s.btn, s.btnGhost, s.btnBlock, s.btnSm)} style={{ marginTop: 12 }} onClick={() => markGone(d.id)}>
        <Check size={16} /> Mcheet — na77i el départ
      </button>
    </article>
  )
}

function Stepper({ value, max, onChange, unit, big }: { value: number; max: number; onChange: (v: number) => void; unit: string; big?: boolean }) {
  return (
    <div className={s.stepper}>
      <button type="button" className={s.stepBtn} onClick={() => {
          tap()
          onChange(Math.max(0, value - 1))
        }} disabled={value <= 0} aria-label="Na99es">
        <Minus size={22} />
      </button>
      <div className={s.stepValue} aria-live="polite">
        <span key={value} className={s.numIn}>{value}</span>
        {big ? `/${max}` : ''}
        <small>{unit}</small>
      </div>
      <button type="button" className={cx(s.stepBtn, s.stepBtnMain)} onClick={() => {
          tap()
          onChange(Math.min(max, value + 1))
        }} disabled={value >= max} aria-label="Zid">
        <Plus size={22} />
      </button>
    </div>
  )
}
