'use client'

// "Colis b louage": send a parcel with a louage driver, track it, and hand it
// over with a 4-digit code the recipient gives the driver.

import { useCallback, useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, Copy, Package, Share2, Van } from '../_components/icons'
import { Toast, cx, tap } from '../_components/ui'
import { CITIES, PARCEL_SIZES, type Parcel, type ParcelSize, formatClock, formatPrice } from '../_lib/data'
import { useBlassa } from '../_lib/store'
import s from '../louage.module.css'

/** Demo timeline: driver pickup, on the road, arrived; delivered once the code is checked. */
function stageOf(p: Parcel, now: number) {
  if (p.deliveredAt) return 3
  const sec = (now - p.createdAt) / 1000
  return sec < 30 ? 0 : sec < 90 ? 1 : 2
}
const STAGES = ['Yestanna el chifour', 'Fel louage, fi triq', 'Wsel lel station', 'Tsallem']

export default function ParcelsPage() {
  const { parcels } = useBlassa()
  const [mode, setMode] = useState<'list' | 'new'>(() => ((parcels ?? []).length ? 'list' : 'new'))
  const [toast, setToast] = useState<string | null>(null)
  const hideToast = useCallback(() => setToast(null), [])

  return (
    <>
      {mode === 'new' ? (
        <NewParcel
          onBack={(parcels ?? []).length ? () => setMode('list') : undefined}
          onSent={() => {
            setMode('list')
            setToast('Colis mab3outh')
          }}
        />
      ) : (
        <>
          <div className={s.pageHead} style={{ marginTop: 18 }}>
            <h1 className={cx(s.display, s.pageTitle)}>Mes colis</h1>
            <p className={s.muted}>Ab3ath colis m3a louage, w tab3ou 7atta yetsallem.</p>
          </div>
          <button type="button" className={cx(s.btn, s.btnPrimary, s.btnBlock, s.searchBtn)} onClick={() => setMode('new')} style={{ marginBottom: 18 }}>
            <Package size={18} /> Ab3ath colis jdid
          </button>
          <div className={s.resList}>
            {(parcels ?? []).map((p) => (
              <ParcelCard key={p.id} p={p} onToast={setToast} />
            ))}
          </div>
        </>
      )}
      {toast && (
        <Toast onDone={hideToast}>
          <Check size={16} /> {toast}
        </Toast>
      )}
    </>
  )
}

function NewParcel({ onBack, onSent }: { onBack?: () => void; onSent: () => void }) {
  const { departures, sendParcel } = useBlassa()
  const [from, setFrom] = useState('Tunis')
  const [to, setTo] = useState('Sousse')
  const [size, setSize] = useState<ParcelSize>('M')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [depId, setDepId] = useState<string | null>(null)

  const options = useMemo(
    () => departures.filter((d) => d.from === from && d.to === to && d.status === 'open').slice(0, 4),
    [departures, from, to],
  )
  const chosen = options.find((d) => d.id === depId) ?? options[0]
  const price = PARCEL_SIZES.find((x) => x.id === size)!.price
  const valid = !!chosen && name.trim().length > 1 && phone.replace(/\D/g, '').length >= 8

  return (
    <>
      <div className={s.navHeader}>
        {onBack ? (
          <button type="button" className={s.iconBtn} onClick={onBack} aria-label="Arja3">
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span />
        )}
        <div className={s.navTitle}>Ab3ath colis</div>
        <span />
      </div>

      <div className={s.colisHero}>
        <Van width={120} />
        <div>
          <b>Colis b louage</b>
          <span>El chifour yhezzou m3ah, w el destinataire ya3tih code bech yestalmou.</span>
        </div>
      </div>

      <div className={s.form}>
        <div className={s.grid2}>
          <label className={s.label}>
            Mnin
            <select className={s.input} value={from} onChange={(e) => { setFrom(e.target.value); setDepId(null) }}>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className={s.label}>
            Win
            <select className={s.input} value={to} onChange={(e) => { setTo(e.target.value); setDepId(null) }}>
              {CITIES.filter((c) => c !== from).map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className={s.label}>
          9addech kbir?
          <div className={s.sizes}>
            {PARCEL_SIZES.map((x) => (
              <button key={x.id} type="button" className={cx(s.sizeBtn, size === x.id && s.choiceOn)} onClick={() => { tap(); setSize(x.id) }} aria-pressed={size === x.id}>
                <Package size={x.id === 'S' ? 18 : x.id === 'M' ? 22 : 26} />
                <b>{x.name}</b>
                <span>{x.hint}</span>
                <em>{x.price} DT</em>
              </button>
            ))}
          </div>
        </div>

        <div className={s.grid2}>
          <label className={s.label}>
            Esm el destinataire
            <input id="parcel-name" className={s.input} placeholder="Mathalan: Amira" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className={s.label}>
            Numérou
            <input id="parcel-phone" className={s.input} inputMode="tel" placeholder="22 123 456" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        </div>

        <div className={s.label}>
          M3a ena louage?
          {options.length === 0 ? (
            <p className={s.hint}>Ma fama 7atta louage ma7loul {from} → {to} taw. Jarreb ba3d chwaya.</p>
          ) : (
            <div className={s.methods} style={{ marginBottom: 0 }}>
              {options.map((d) => (
                <button key={d.id} type="button" className={cx(s.method, chosen?.id === d.id && s.methodOn)} onClick={() => setDepId(d.id)}>
                  <Van width={44} stripe={d.kind === 'regional' ? 'blue' : 'red'} />
                  <span style={{ flex: 1 }}>
                    <span className={s.methodName} style={{ display: 'block' }}>{d.driver.name} · {d.driver.plate}</span>
                    <span className={s.methodHint}>
                      {d.station.replace('Station ', '')} · {d.departAt ? `départ ${formatClock(d.departAt)}` : 'yemchi ki y3abi'}
                    </span>
                  </span>
                  <span className={s.radio} />
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={cx(s.btn, s.btnPrimary, s.btnBlock, s.searchBtn)}
          disabled={!valid}
          onClick={() => {
            tap(14)
            sendParcel({
              from,
              to,
              size,
              price,
              recipient: { name: name.trim(), phone: phone.trim() },
              departureId: chosen!.id,
              driverName: chosen!.driver.name,
              plate: chosen!.driver.plate,
            })
            onSent()
          }}
        >
          Ab3ath el colis · {formatPrice(price)} DT <ArrowRight size={18} />
        </button>
        <p className={s.demoNote} style={{ marginTop: 0 }}>Tkhalles lel chifour ki ta3tih el colis. Blassa ma takhou 7atta commission.</p>
      </div>
    </>
  )
}

function ParcelCard({ p, onToast }: { p: Parcel; onToast: (t: string) => void }) {
  const { now, confirmParcel } = useBlassa()
  const [pin, setPin] = useState('')
  const stage = stageOf(p, now)
  const msg = `📦 Ab3athtlek colis b louage ${p.from} → ${p.to} (chifour ${p.driverName}, ${p.plate}). Suivi: ${p.code}. Ki testalmou, a3ti lel chifour el code: ${p.pin}`

  const shareCode = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Blassa colis', text: msg })
        return
      }
    } catch {
      /* fall back to WhatsApp */
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
  }

  return (
    <article className={s.parcel}>
      <div className={s.parcelHead}>
        <div>
          <b>{p.from} → {p.to}</b>
          <span className={s.muted}> · {PARCEL_SIZES.find((x) => x.id === p.size)?.name}</span>
          <div className={s.muted} style={{ fontSize: 13 }}>Pour {p.recipient.name} · {p.recipient.phone}</div>
        </div>
        <button
          type="button"
          className={s.codeChip}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(p.code)
              onToast('Code copié')
            } catch {
              onToast(p.code)
            }
          }}
          aria-label="Copier le code de suivi"
        >
          {p.code} <Copy size={13} />
        </button>
      </div>

      <ol className={s.track}>
        {STAGES.map((label, i) => (
          <li key={label} className={cx(i <= stage && s.trackDone, i === stage && s.trackNow)}>
            <i />
            <span>{label}</span>
          </li>
        ))}
      </ol>

      <div className={s.parcelFoot}>
        <span className={s.muted} style={{ fontSize: 13 }}>
          {p.driverName} · {p.plate} · {formatPrice(p.price)} DT
        </span>
      </div>

      {stage < 3 && (
        <button type="button" className={cx(s.btn, s.btnSm, s.fillBtn)} onClick={shareCode}>
          <Share2 size={16} /> Ab3ath el code lel destinataire
        </button>
      )}

      {stage === 2 && (
        <form
          className={s.pinRow}
          onSubmit={(e) => {
            e.preventDefault()
            if (confirmParcel(p.id, pin)) {
              tap(14)
              onToast('Colis tsallem')
            } else onToast('Code ghalet')
          }}
        >
          <input
            id={`pin-${p.id}`}
            className={s.input}
            inputMode="numeric"
            maxLength={4}
            placeholder="Code mta3 el destinataire"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            aria-label="Code de remise"
          />
          <button type="submit" className={cx(s.btn, s.btnPrimary, s.btnSm)} disabled={pin.length !== 4}>
            Confirmer
          </button>
        </form>
      )}
      {stage === 2 && <p className={s.hint} style={{ marginTop: 6 }}>Démo: el code howa {p.pin} (el chifour ya3mlou ki ysallem el colis).</p>}
    </article>
  )
}
