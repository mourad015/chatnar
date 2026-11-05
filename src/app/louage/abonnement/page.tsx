'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Bell, Check, Gift, LoaderCircle, RotateCcw, ShieldCheck, TrendingUp, Users, Wallet } from '../_components/icons'
import { Logo, cx } from '../_components/ui'
import { PAY_METHODS, PLANS, formatPrice, type PayMethod, type PlanId } from '../_lib/data'
import { TRIAL_DAYS, useBlassa } from '../_lib/store'
import s from '../louage.module.css'

const LOGO_CLASS: Record<PayMethod, string> = { flouci: s.mFlouci, d17: s.mD17, card: s.mCard }
const LOGO_TEXT: Record<PayMethod, string> = { flouci: 'flouci', d17: 'D17', card: 'CARD' }

export default function SubscriptionPage() {
  const router = useRouter()
  const { ready, driver, usedTrial, isSubscribed, subscription, subscribe, cancelSubscription, resetDemo, now } = useBlassa()
  const [plan, setPlan] = useState<PlanId>('quarter')
  const [method, setMethod] = useState<PayMethod>('flouci')
  const [paying, setPaying] = useState(false)

  const chosen = PLANS.find((p) => p.id === plan)!
  const trial = !usedTrial

  const pay = () => {
    setPaying(true)
    // Simulated payment gateway round-trip.
    setTimeout(() => {
      subscribe(plan, method)
      setPaying(false)
      router.push('/louage/chauffeur')
    }, 1400)
  }

  return (
    <>
      <header className={s.topbar}>
        <Logo />
        <span className={cx(s.pill, s.pillRed)}>Lel chifourat</span>
      </header>

      <div className={s.pageHead}>
        <p className={s.eyebrow}>Abonnement chhari</p>
        <h1 className={cx(s.display, s.pageTitle)}>Soum wa7ed. Rokkab akthar.</h1>
        <p className={s.muted}>Ma fama 7atta commission 3al blassa. Tkhalles abonnement, w el flous mta3 el trajet lik el kol.</p>
      </div>

      {!ready && <div className={s.skeleton} style={{ height: 360 }} />}

      {ready && isSubscribed && subscription && (
        <>
          <section className={s.status}>
            <div className={s.statusTop}>
              <span className={s.eyebrow} style={{ color: 'var(--hero-muted)' }}>Abonnement actif</span>
              <span className={cx(s.pill, s.pillGreen)}><Check size={12} /> {PLANS.find((p) => p.id === subscription.plan)?.name}</span>
            </div>
            <div className={cx(s.display, s.statusBig)}>
              {Math.ceil((subscription.until - now) / 86_400_000)} jour ba9in
            </div>
            <div className={s.statusSub}>
              Khlast b {PAY_METHODS.find((m) => m.id === subscription.method)?.name} · yekmel{' '}
              {new Date(subscription.until).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </section>
          <Link href="/louage/chauffeur" className={cx(s.btn, s.btnInk, s.btnBlock)}>
            Arja3 lel tableau de bord <ArrowRight size={18} />
          </Link>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button type="button" className={s.linkBtn} onClick={cancelSubscription}>Batel el abonnement</button>
          </div>
        </>
      )}

      {ready && !isSubscribed && (
        <>
          {trial && (
            <div className={s.trialBanner}>
              <Gift size={26} />
              <div>
                <b>Awel chhar b bleech</b>
                {TRIAL_DAYS} jour hdiya, yetzedou 3al abonnement elli tekhtarou.
              </div>
            </div>
          )}

          <div className={s.plans} role="radiogroup" aria-label="Plan">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={plan === p.id}
                className={cx(s.plan, plan === p.id && s.planOn)}
                onClick={() => setPlan(p.id)}
              >
                {p.best && <span className={s.best}>El a7sen</span>}
                <span className={s.radio} />
                <span className={s.planBody}>
                  <span className={s.planName} style={{ display: 'block' }}>{p.name}</span>
                  <span className={s.planNote}>{p.note}</span>
                </span>
                <span className={s.planPrice}>
                  {p.price} DT
                  <small>{formatPrice(p.perMonth)} DT/chhar</small>
                </span>
              </button>
            ))}
          </div>

          <ul className={cx(s.perks, s.perksLight)} style={{ margin: '4px 2px 22px' }}>
            <li>
              <span className={s.perkIcon}><Bell size={16} /></span>
              <div><b>Départs bla 7seb</b><span>Kol el trajets elli t7ebhom.</span></div>
            </li>
            <li>
              <span className={s.perkIcon}><Users size={16} /></span>
              <div><b>Réservations mel rokkab</b><span>Yhezzou blassa w yeklbouk direct.</span></div>
            </li>
            <li>
              <span className={s.perkIcon}><TrendingUp size={16} /></span>
              <div><b>0% commission</b><span>Flous el trajet lik 100%.</span></div>
            </li>
          </ul>

          <p className={s.eyebrow} style={{ margin: '0 2px 10px' }}>Kifech bech tkhalles</p>
          <div className={s.methods} role="radiogroup" aria-label="Mode de paiement">
            {PAY_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={method === m.id}
                className={cx(s.method, method === m.id && s.methodOn)}
                onClick={() => setMethod(m.id)}
              >
                <span className={cx(s.methodLogo, LOGO_CLASS[m.id])}>{LOGO_TEXT[m.id]}</span>
                <span style={{ flex: 1 }}>
                  <span className={s.methodName} style={{ display: 'block' }}>{m.name}</span>
                  <span className={s.methodHint}>{m.hint}</span>
                </span>
                <span className={s.radio} />
              </button>
            ))}
          </div>

          <div className={s.summary}>
            <div className={s.summaryRow}>
              <span>{chosen.name}</span>
              <span>{chosen.price} DT</span>
            </div>
            {trial && (
              <div className={s.summaryRow} style={{ color: 'var(--green)' }}>
                <span>+ Chhar hdiya</span>
                <span>0 DT</span>
              </div>
            )}
            <div className={cx(s.summaryRow, s.summaryTotal)}>
              <span>{trial ? 'Tkhalles ba3d el chhar el loul' : 'Tkhalles lyoum'}</span>
              <span>{chosen.price} DT</span>
            </div>
          </div>

          {!driver ? (
            <Link href="/louage/chauffeur" className={cx(s.btn, s.btnInk, s.btnBlock)}>
              A3mel profil chifour 9bal <ArrowRight size={18} />
            </Link>
          ) : (
            <button type="button" className={cx(s.btn, s.btnPrimary, s.btnBlock)} onClick={pay} disabled={paying}>
              {paying ? (
                <><LoaderCircle size={18} className={s.spin} /> Jari el khlas…</>
              ) : trial ? (
                <><Gift size={18} /> Ebda chhar b bleech</>
              ) : (
                <><Wallet size={18} /> Khalles {chosen.price} DT</>
              )}
            </button>
          )}
          <p className={s.demoNote}>
            <ShieldCheck size={12} style={{ verticalAlign: '-2px' }} /> Tbatel wa9t ma t7eb, bla 7atta frais.
          </p>
        </>
      )}

      <p className={s.demoNote} style={{ marginTop: 28 }}>
        Version démo: el khlas mouch 7a9i9i w el data tetkhazen fi téléphonek bark.{' '}
        <button type="button" className={s.linkBtn} onClick={resetDemo} style={{ fontSize: 12 }}>
          <RotateCcw size={11} style={{ verticalAlign: '-1px' }} /> Reset
        </button>
      </p>
    </>
  )
}
