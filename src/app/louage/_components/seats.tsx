'use client'

// "Ekhtar blastek": the louage seen from above, pick your exact seat.
// "Kammel el louage": share a link so friends fill the last seats faster.

import { useState } from 'react'
import { Share2, SteeringWheel } from './icons'
import { cx, tap } from './ui'
import { type Departure, type SeatOcc, SEAT_ROWS, seatLabel, seatsNextToWomen } from '../_lib/data'
import s from '../louage.module.css'

export function SeatPicker({
  d,
  value,
  onChange,
  locked,
}: {
  d: Departure
  value: number | null
  onChange: (seat: number) => void
  /** Rider already holds a seat here: show it, no picking. */
  locked?: boolean
}) {
  const [nearWomen, setNearWomen] = useState(false)
  const map = d.seatMap ?? []
  const womenOk = seatsNextToWomen(map)

  return (
    <div className={s.seatPick}>
      <div className={s.seatPickHead}>
        <b>Ekhtar blastek</b>
        {!locked && (
          <button
            type="button"
            className={cx(s.chip, nearWomen && s.chipOn)}
            style={{ padding: '6px 11px', fontSize: 12.5 }}
            onClick={() => setNearWomen((v) => !v)}
            aria-pressed={nearWomen}
          >
            7dhe mra
          </button>
        )}
      </div>

      <div className={s.vanTop} aria-label="Plan du louage">
        <span className={s.vanWindshield} aria-hidden />
        {SEAT_ROWS.map((row, r) => (
          <div key={r} className={s.vanRow}>
            {row.map((cell) =>
              cell === 'driver' ? (
                <span key="driver" className={cx(s.vSeat, s.vDriver)} aria-label="Chauffeur">
                  <SteeringWheel size={18} />
                </span>
              ) : (
                <SeatButton
                  key={cell}
                  i={cell}
                  occ={map[cell] ?? null}
                  selected={value === cell}
                  hint={nearWomen && womenOk.has(cell)}
                  disabled={locked || !!map[cell]}
                  onPick={() => {
                    tap()
                    onChange(cell)
                  }}
                />
              ),
            )}
          </div>
        ))}
      </div>

      <div className={s.legend} style={{ flexWrap: 'wrap', rowGap: 6 }}>
        <span><i className={s.legendSwatch} style={{ background: 'var(--surface)', border: '1.5px solid var(--line-strong)' }} /> Fergha</span>
        <span><i className={s.legendSwatch} style={{ background: 'var(--ink)' }} /> Ma3mra</span>
        <span><i className={s.legendSwatch} style={{ background: 'var(--women)' }} /> Mra</span>
        <span><i className={s.legendSwatch} style={{ background: 'var(--red)' }} /> Blastek</span>
      </div>
      {nearWomen && !locked && (
        <p className={s.hint} style={{ marginTop: 8 }}>
          {womenOk.size ? 'El blayes el khodhra 7dhe nsa bark.' : 'Ma fama 7atta blassa fergha 7dhe nsa fel louage hedha.'}
        </p>
      )}
    </div>
  )
}

function SeatButton({
  i,
  occ,
  selected,
  hint,
  disabled,
  onPick,
}: {
  i: number
  occ: SeatOcc
  selected: boolean
  hint: boolean
  disabled?: boolean
  onPick: () => void
}) {
  const state = occ === 'me' || selected ? 'me' : occ === 'f' ? 'f' : occ ? 'm' : 'free'
  return (
    <button
      type="button"
      className={cx(s.vSeat, state === 'me' && s.vMe, state === 'f' && s.vWoman, state === 'm' && s.vTaken, hint && s.vHint)}
      onClick={onPick}
      disabled={disabled && state !== 'me'}
      aria-pressed={selected}
      aria-label={`Blassa ${i + 1}, ${seatLabel(i)}${occ ? ', ma3mra' : ''}`}
    >
      {i + 1}
    </button>
  )
}

/** Share text for "Kammel el louage". */
export function fillMessage(d: Departure) {
  const left = d.seats - d.filled
  const url = typeof location !== 'undefined' ? `${location.origin}${location.pathname}` : ''
  return `🚐 Louage ${d.from} → ${d.to} (${d.station}) yemchi ki y3abi: ne9es ${left} ${left === 1 ? 'blassa' : 'blayes'} bark! 7jez blastek 3la Blassa: ${url}`
}

export function FillBar({ d, compact }: { d: Departure; compact?: boolean }) {
  const left = d.seats - d.filled
  if (d.departAt || left <= 0) return null
  const share = async () => {
    tap()
    const text = fillMessage(d)
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Blassa', text })
        return
      }
    } catch {
      /* cancelled or blocked: fall back to WhatsApp */
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }
  return (
    <div className={cx(s.fill, compact && s.fillCompact)}>
      <div className={s.fillTop}>
        <span>
          <b>Kammel el louage</b>
          <span className={s.muted}> · ne9es {left} w yemchi</span>
        </span>
        <span className={s.fillCount}>{d.filled}/{d.seats}</span>
      </div>
      <div className={s.fillBar}>
        <span style={{ width: `${(d.filled / d.seats) * 100}%` }} />
      </div>
      <button type="button" className={cx(s.btn, s.btnSm, s.fillBtn)} onClick={share}>
        <Share2 size={16} /> Ab3ath l s7abek bech yemchi asra3
      </button>
    </div>
  )
}
