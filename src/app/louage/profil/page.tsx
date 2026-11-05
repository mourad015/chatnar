'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { BadgeCheck, BellIcon, Car, Check, ChevronRight, FileText, Globe, Heart, Info, LifeBuoy, LogOut, Settings, Shield, SteeringWheel, User } from '../_components/icons'
import { Toast, cx, tap } from '../_components/ui'
import { useBlassa } from '../_lib/store'
import s from '../louage.module.css'

export default function ProfilePage() {
  const router = useRouter()
  const { user, reservations, logout, setRole } = useBlassa()
  const [toast, setToast] = useState<string | null>(null)
  const hideToast = useCallback(() => setToast(null), [])
  if (!user) return null
  const initials = user.name.split(' ').map((p) => p[0]).join('').slice(0, 2)
  const soon = (what: string) => () => setToast(`${what} : bientôt disponible`)

  return (
    <>
      <div className={s.header} style={{ justifyContent: 'flex-end' }}>
        <button type="button" className={s.iconBtn} aria-label="Réglages" onClick={soon('Réglages')}>
          <Settings size={20} />
        </button>
      </div>
      <div className={s.profileHead}>
        <span className={s.profileAvatar}>{initials}</span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{user.name}</div>
          <div className={s.muted} style={{ fontSize: 14 }}>{user.phone}</div>
          <span className={cx(s.dotPill, user.role === 'driver' ? s.dotRed : s.dotGrey)} style={{ marginTop: 6 }}>
            <i /> {user.role === 'driver' ? 'Chauffeur louage' : 'Passager'}
          </span>
        </div>
      </div>

      <div className={s.menu}>
        <Link href="/louage/trajets" className={s.menuRow}><Car size={20} /><span>Mes trajets</span><ChevronRight size={18} className={s.sChevron} /></Link>
        <Link href="/louage/favoris" className={s.menuRow}><Heart size={20} /><span>Mes favoris</span><ChevronRight size={18} className={s.sChevron} /></Link>
        <button type="button" className={s.menuRow} onClick={soon('Notifications')}>
          <BellIcon size={20} /><span>Notifications</span>
          {reservations.length > 0 && <span className={s.countBadge}>{reservations.length}</span>}
          <ChevronRight size={18} className={s.sChevron} />
        </button>
        <button type="button" className={s.menuRow} onClick={soon('Langue')}>
          <Globe size={20} /><span>Langue</span><span className={s.menuValue}>Français</span><ChevronRight size={18} className={s.sChevron} />
        </button>
      </div>

      <p className={s.eyebrow} style={{ margin: '22px 4px 10px' }}>Espace chauffeur</p>
      <div className={s.menu}>
        {user.role === 'driver' ? (
          <>
            <Link href="/louage/chauffeur" className={s.menuRow}><SteeringWheel size={20} /><span>Tableau de bord</span><ChevronRight size={18} className={s.sChevron} /></Link>
            <Link href="/louage/abonnement" className={s.menuRow}><BadgeCheck size={20} /><span>Abonnement</span><ChevronRight size={18} className={s.sChevron} /></Link>
            <button type="button" className={s.menuRow} onClick={() => { tap(); setRole('rider'); setToast('Mode passager') }}>
              <User size={20} /><span>Passer en mode passager</span><ChevronRight size={18} className={s.sChevron} />
            </button>
          </>
        ) : (
          <button type="button" className={s.menuRow} onClick={() => { tap(); setRole('driver'); router.push('/louage/chauffeur') }}>
            <SteeringWheel size={20} /><span>Je suis chauffeur de louage</span><ChevronRight size={18} className={s.sChevron} />
          </button>
        )}
      </div>

      <p className={s.eyebrow} style={{ margin: '22px 4px 10px' }}>Infos</p>
      <div className={s.menu}>
        <button type="button" className={s.menuRow} onClick={soon('Aide')}><LifeBuoy size={20} /><span>Aide &amp; support</span><ChevronRight size={18} className={s.sChevron} /></button>
        <button type="button" className={s.menuRow} onClick={soon('À propos')}><Info size={20} /><span>À propos</span><ChevronRight size={18} className={s.sChevron} /></button>
        <button type="button" className={s.menuRow} onClick={soon('Conditions')}><FileText size={20} /><span>Conditions d&apos;utilisation</span><ChevronRight size={18} className={s.sChevron} /></button>
        <button type="button" className={s.menuRow} onClick={soon('Confidentialité')}><Shield size={20} /><span>Confidentialité</span><ChevronRight size={18} className={s.sChevron} /></button>
      </div>

      <button
        type="button"
        className={cx(s.btn, s.btnGhost, s.btnBlock)}
        style={{ marginTop: 22, color: 'var(--red)' }}
        onClick={() => {
          logout()
          router.push('/louage')
        }}
      >
        <LogOut size={18} /> Se déconnecter
      </button>

      {toast && (
        <Toast onDone={hideToast}>
          <Check size={16} /> {toast}
        </Toast>
      )}
    </>
  )
}
