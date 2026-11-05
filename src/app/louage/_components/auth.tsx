'use client'

// First run: splash, welcome, phone login with SMS code, role, name.
// The SMS is simulated: the code shows up as a phone notification banner.

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, LogOut, SteeringWheel, User, Van } from './icons'
import { Avatar, Sheet, TabBar, cx, tap } from './ui'
import { BlassaMark, TAGLINE_AR, Wordmark } from './brand'
import { type Role, useBlassa } from '../_lib/store'
import s from '../louage.module.css'

/* ---------- gate ---------- */

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, user } = useBlassa()
  const path = usePathname()
  const [phase, setPhase] = useState<'splash' | 'leaving' | 'done'>('splash')

  useEffect(() => {
    if (!ready) return
    const a = setTimeout(() => setPhase('leaving'), 2300)
    const b = setTimeout(() => setPhase('done'), 2850)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [ready])

  // Same tree positions in every phase, so the splash is never remounted
  // (a remount would replay its animation while it fades out).
  const content =
    phase === 'splash' ? null : !user ? (
      <AuthFlow />
    ) : (
      <>
        {/* Keyed by route so each screen springs in. */}
        <div className={s.shell}>
          <div key={path} className={s.page}>
            {children}
          </div>
        </div>
        <TabBar />
      </>
    )
  return (
    <>
      {content}
      {phase !== 'done' && <Splash leaving={phase === 'leaving'} />}
    </>
  )
}

function Splash({ leaving }: { leaving?: boolean }) {
  const words = TAGLINE_AR.split('، ')
  return (
    <div className={cx(s.splash, leaving && s.splashOut)} role="status" aria-label="Blassa">
      <div className={s.spStage}>
        <div className={s.spLines} aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className={s.spTile}>
          <BlassaMark size={124} />
          <span className={s.spShine} aria-hidden />
        </div>
        <span className={s.spShadow} aria-hidden />
      </div>

      <div className={s.spWordClip}>
        <div className={s.spWord}>
          Blassa
          <svg className={s.spSwoosh} viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden>
            <path d="M0 9 C30 1 70 0 100 3 C70 3 35 5 0 9 Z" fill="#E31B23" />
          </svg>
        </div>
      </div>

      <div className={s.spTag} lang="ar" dir="rtl">
        {words.map((w, i) => (
          <span key={w} style={{ animationDelay: `${1250 + i * 160}ms`, color: i === words.length - 1 ? '#E31B23' : undefined }}>
            {w}
            {i < words.length - 1 ? '،' : ''}
          </span>
        ))}
      </div>
      <div className={s.splashMade}>Sna3a tounsia</div>
    </div>
  )
}

/* ---------- flow ---------- */

type Step = 'welcome' | 'phone' | 'otp' | 'role' | 'name'

function formatPhone(digits: string) {
  const d = digits.slice(0, 8)
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 8)].filter(Boolean).join(' ')
}

function AuthFlow() {
  const router = useRouter()
  const { login } = useBlassa()
  const [step, setStepRaw] = useState<Step>('welcome')
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  const ORDER: Step[] = ['welcome', 'phone', 'otp', 'role', 'name']
  const setStep = (next: Step | ((st: Step) => Step)) =>
    setStepRaw((cur) => {
      const n = typeof next === 'function' ? next(cur) : next
      setDir(ORDER.indexOf(n) < ORDER.indexOf(cur) ? 'back' : 'fwd')
      return n
    })
  const [digits, setDigits] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const [sentAt, setSentAt] = useState(0)
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')

  const phoneOk = /^[2459]\d{7}$/.test(digits)

  const sendCode = useCallback(() => {
    setSent(String(1000 + Math.floor(Math.random() * 9000)))
    setSentAt(Date.now())
    setCode('')
  }, [])

  const back = () =>
    setStep((st) => (st === 'phone' ? 'welcome' : st === 'otp' ? 'phone' : st === 'role' ? 'otp' : st === 'name' ? 'role' : st))

  const finish = () => {
    const r = role ?? 'rider'
    login({ phone: `+216 ${formatPhone(digits)}`, name: name.trim(), role: r })
    router.push(r === 'driver' ? '/louage/chauffeur' : '/louage')
  }

  if (step === 'welcome')
    return (
      <div key="welcome" className={dir === 'back' ? s.stepBack : s.page}>
        <Welcome onStart={() => setStep('phone')} />
      </div>
    )

  return (
    <div className={s.auth}>
      <div className={s.authTop}>
        <button type="button" className={s.backBtn} onClick={back} aria-label="Arja3">
          <ChevronLeft size={22} />
        </button>
        <Progress step={step} />
      </div>

      {step === 'phone' && (
        <form
          key="phone"
          className={cx(s.authBody, dir === 'fwd' ? s.stepFwd : s.stepBack)}
          onSubmit={(e) => {
            e.preventDefault()
            if (!phoneOk) return
            sendCode()
            setStep('otp')
          }}
        >
          <h1 className={cx(s.display, s.authTitle)}>Chnouwa numérok?</h1>
          <p className={s.authSub}>Bech nab3athoulek code b SMS. Ma nwarriwech numérok l 7add.</p>
          <label className={s.phoneField}>
            <span className={s.phonePrefix}>
              <TunisiaFlag />
              +216
            </span>
            <input
              id="auth-phone"
              className={s.phoneInput}
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="22 123 456"
              value={formatPhone(digits)}
              onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 8))}
              aria-label="Numéro téléphone"
              autoFocus
            />
          </label>
          {digits.length === 8 && !phoneOk && <p className={s.authError}>El numéro lezem yebda b 2, 4, 5 wala 9.</p>}
          <div className={s.authFoot}>
            <button type="submit" className={cx(s.btn, s.btnPrimary, s.btnBlock)} disabled={!phoneOk}>
              Kammel <ArrowRight size={18} />
            </button>
            <p className={s.authLegal}>Ki tkammel, enti mwafe9 3al conditions d&apos;utilisation w el politique de confidentialité mta3 Blassa.</p>
          </div>
        </form>
      )}

      {step === 'otp' && (
        <OtpStep
          phone={`+216 ${formatPhone(digits)}`}
          code={code}
          setCode={setCode}
          expected={sent}
          sentAt={sentAt}
          onResend={sendCode}
          onChangeNumber={() => setStep('phone')}
          onOk={() => {
            tap(14)
            setStep('role')
          }}
          dir={dir}
        />
      )}

      {step === 'role' && (
        <div key="role" className={cx(s.authBody, dir === 'fwd' ? s.stepFwd : s.stepBack)}>
          <h1 className={cx(s.display, s.authTitle)}>Chkoun enti?</h1>
          <p className={s.authSub}>Tnajem tbaddel ba3d men el compte mte3ek.</p>
          <div className={s.roles} role="radiogroup" aria-label="Chkoun enti">
            <RoleCard
              on={role === 'rider'}
              onClick={() => {
                tap()
                setRole('rider')
              }}
              icon={<User size={26} />}
              title="Rakeb"
              sub="Nlawej 3la blassa f louage"
            />
            <RoleCard
              on={role === 'driver'}
              onClick={() => {
                tap()
                setRole('driver')
              }}
              icon={<SteeringWheel size={26} />}
              title="Chifour louage"
              sub="3andi louage w n7eb n3abbih asra3"
            />
          </div>
          <div className={s.authFoot}>
            <button type="button" className={cx(s.btn, s.btnPrimary, s.btnBlock)} disabled={!role} onClick={() => setStep('name')}>
              Kammel <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 'name' && (
        <form
          key="name"
          className={cx(s.authBody, s.stepFwd)}
          onSubmit={(e) => {
            e.preventDefault()
            if (name.trim().length > 1) finish()
          }}
        >
          <h1 className={cx(s.display, s.authTitle)}>Chnouwa esmek?</h1>
          <p className={s.authSub}>
            {role === 'driver' ? 'El rokkab yetchoufou esmek ki y7jzou 3andek.' : 'El chifour yetchouf esmek ki t7jez blassa.'}
          </p>
          <input
            id="auth-name"
            className={s.input}
            style={{ minHeight: 58, fontSize: 18 }}
            placeholder="Esmek w la9bek"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className={s.authFoot}>
            <button type="submit" className={cx(s.btn, s.btnPrimary, s.btnBlock)} disabled={name.trim().length < 2}>
              Ad5ol l Blassa <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      {sent && step === 'otp' && <SmsBanner key={sentAt} code={sent} />}
    </div>
  )
}

function Progress({ step }: { step: Step }) {
  const order: Step[] = ['phone', 'otp', 'role', 'name']
  const i = order.indexOf(step)
  return (
    <div className={s.progress} aria-label={`Marhla ${i + 1} men ${order.length}`}>
      {order.map((st, k) => (
        <span key={st} className={cx(s.progressBar, k <= i && s.progressOn)} />
      ))}
    </div>
  )
}

/* ---------- welcome ---------- */

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className={s.welcome}>
      <div className={s.welcomeArt}>
        <WelcomeScene />
      </div>
      <div className={s.welcomeBody}>
        <div className={s.logo} style={{ marginBottom: 14 }}>
          <BlassaMark size={48} />
          <Wordmark size={30} />
        </div>
        <p className={s.splashTag} lang="ar" dir="rtl" style={{ color: 'var(--red)', textAlign: 'left', marginBottom: 8, animation: 'none' }}>{TAGLINE_AR}</p>
        <h1 className={cx(s.display, s.welcomeTitle)}>El louage, men téléphonek.</h1>
        <p className={s.authSub}>Chouf el blayes el fergha, el soum w wa9t el départ 9bal ma to5rej mel dar.</p>
        <ul className={s.welcomePoints}>
          <li><Check size={16} /> Blayes live fi kol station</li>
          <li><Check size={16} /> T7ajez blastek b click</li>
          <li><Check size={16} /> Tkhalles lel chifour kima dima</li>
        </ul>
        <button type="button" className={cx(s.btn, s.btnPrimary, s.btnBlock)} onClick={onStart}>
          Ebda <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

/** Road scene: palm, station sign, louage on the road. */
function WelcomeScene() {
  return (
    <svg viewBox="0 0 360 230" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <circle cx="226" cy="58" r="24" fill="#f5b400" />
      {/* palm */}
      <path d="M70 178c2-34 4-58 14-84" stroke="var(--ink)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round">
        <path d="M84 94c-14-10-30-10-42 0" />
        <path d="M84 94c-6-16-20-24-34-22" />
        <path d="M84 94c8-14 24-18 36-12" />
        <path d="M84 94c16-4 30 4 36 16" />
        <path d="M84 94c2-16 12-26 24-28" />
      </g>
      {/* station sign */}
      <rect x="314" y="96" width="4" height="82" fill="var(--ink)" />
      <rect x="284" y="84" width="64" height="26" rx="5" fill="var(--ink)" />
      <text x="316" y="101.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--bg)" fontFamily="var(--font-body), sans-serif" letterSpacing=".5">
        LOUAGE
      </text>
      {/* road */}
      <rect x="0" y="178" width="360" height="52" fill="var(--surface-3)" />
      <g stroke="var(--bg)" strokeWidth="3" strokeDasharray="18 14">
        <line x1="0" y1="206" x2="360" y2="206" />
      </g>
      <Van x={108} y={128} width={150} />
    </svg>
  )
}

function TunisiaFlag() {
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden style={{ borderRadius: 3, flex: 'none' }}>
      <rect width="24" height="16" fill="#e70013" />
      <circle cx="12" cy="8" r="5" fill="#fff" />
      <circle cx="12.6" cy="8" r="3.4" fill="#e70013" />
      <circle cx="13.6" cy="8" r="2.7" fill="#fff" />
      <polygon points="16.30,8.00 15.05,8.47 14.99,9.81 14.15,8.76 12.86,9.12 13.60,8.00 12.86,6.88 14.15,7.24 14.99,6.19 15.05,7.53" fill="#e70013" />
    </svg>
  )
}

/* ---------- OTP ---------- */

function OtpStep(props: {
  phone: string
  code: string
  setCode: (c: string) => void
  expected: string | null
  sentAt: number
  onResend: () => void
  onChangeNumber: () => void
  onOk: () => void
  dir: 'fwd' | 'back'
}) {
  const { phone, code, setCode, expected, sentAt, onResend, onChangeNumber, onOk, dir } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const [now, setNow] = useState(() => Date.now())
  const wait = Math.max(0, 30 - Math.floor((now - sentAt) / 1000))
  const wrong = code.length === 4 && code !== expected

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (code.length === 4 && code === expected) {
      const t = setTimeout(onOk, 350)
      return () => clearTimeout(t)
    }
  }, [code, expected, onOk])

  return (
    <div key="otp" className={cx(s.authBody, dir === 'fwd' ? s.stepFwd : s.stepBack)}>
      <h1 className={cx(s.display, s.authTitle)}>Ekteb el code</h1>
      <p className={s.authSub}>
        Ab3athna code fih 4 ar9am l <b style={{ color: 'var(--ink)' }}>{phone}</b>.{' '}
        <button type="button" className={s.linkBtn} onClick={onChangeNumber} style={{ fontSize: 'inherit' }}>Badel el numéro</button>
      </p>
      <label className={cx(s.otp, wrong && s.otpWrong)} onClick={() => inputRef.current?.focus()}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cx(s.otpBox, i === code.length && s.otpActive, code.length === 4 && !wrong && s.otpOk)}>
            {code[i] ?? ''}
          </span>
        ))}
        <input
          id="auth-otp"
          ref={inputRef}
          className={s.otpInput}
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
          aria-label="Code SMS"
          autoFocus
        />
      </label>
      {wrong && <p className={s.authError}>El code ghalet. Thabbet fel SMS w 3awed.</p>}
      <div className={s.authFoot}>
        <button type="button" className={cx(s.btn, s.btnGhost, s.btnBlock)} disabled={wait > 0} onClick={onResend}>
          {wait > 0 ? `3awed ab3ath el code (0:${String(wait).padStart(2, '0')})` : '3awed ab3ath el code'}
        </button>
      </div>
    </div>
  )
}

function SmsBanner({ code }: { code: string }) {
  const [show, setShow] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 9000)
    return () => clearTimeout(t)
  }, [])
  if (!show) return null
  return (
    <div className={s.sms} role="status">
      <div className={s.smsHead}>
        <span className={s.smsApp}>Messages</span>
        <span>taw</span>
      </div>
      <div className={s.smsText}>
        <b>Blassa</b> · Code mte3ek <b className={s.smsCode}>{code}</b>. Ma t3atih l 7add.
      </div>
      <div className={s.smsNote}>Version démo: el SMS mouch 7a9i9i</div>
    </div>
  )
}

function RoleCard({ on, onClick, icon, title, sub }: { on: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button type="button" role="radio" aria-checked={on} className={cx(s.roleCard, on && s.roleOn)} onClick={onClick}>
      <span className={s.roleIcon}>{icon}</span>
      <span style={{ flex: 1 }}>
        <span className={s.roleTitle}>{title}</span>
        <span className={s.roleSub}>{sub}</span>
      </span>
      <span className={s.radio} />
    </button>
  )
}

/* ---------- account ---------- */

export function AccountButton() {
  const router = useRouter()
  const { user, logout, setRole } = useBlassa()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  if (!user) return null

  const other: Role = user.role === 'driver' ? 'rider' : 'driver'
  const signOut = () => {
    close()
    logout()
    router.push('/louage')
  }
  const switchRole = () => {
    setRole(other)
    close()
    router.push(other === 'driver' ? '/louage/chauffeur' : '/louage')
  }

  return (
    <>
      <button type="button" className={s.accountBtn} onClick={() => setOpen(true)} aria-label="El compte mte3ek">
        <Avatar name={user.name} />
      </button>
      <button type="button" className={s.logoutBtn} onClick={signOut} aria-label="Okhrej" title="Okhrej">
        <LogOut size={17} />
      </button>
      {open && (
        <Sheet onClose={close} label="El compte">
          <div className={s.driver} style={{ margin: '14px 0 18px' }}>
            <Avatar name={user.name} />
            <div>
              <div className={cx(s.display)} style={{ fontSize: 24 }}>{user.name}</div>
              <div className={s.muted} style={{ fontSize: 14 }}>{user.phone}</div>
            </div>
          </div>
          <div className={s.summary}>
            <div className={s.summaryRow}>
              <span className={s.muted}>Compte</span>
              <b>{user.role === 'driver' ? 'Chifour louage' : 'Rakeb'}</b>
            </div>
            <div className={s.summaryRow}>
              <span className={s.muted}>M3ana men</span>
              <b>{new Date(user.joinedAt).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' })}</b>
            </div>
          </div>
          <button type="button" className={cx(s.btn, s.btnPrimary, s.btnBlock)} onClick={switchRole} style={{ marginBottom: 10 }}>
            {other === 'driver' ? <SteeringWheel size={18} /> : <User size={18} />}
            {other === 'driver' ? 'Wali chifour' : 'Wali rakeb'}
          </button>
          <button type="button" className={cx(s.btn, s.btnGhost, s.btnBlock)} onClick={signOut}>
            <LogOut size={18} /> Okhrej
          </button>
          <p className={s.demoNote}>Ki to5rej, tnajem tod5ol men jdid w tekhtar rakeb wala chifour.</p>
        </Sheet>
      )}
    </>
  )
}
