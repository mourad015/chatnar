// Flat illustrations for the home screen: a Tunisian street with a minaret,
// white houses and palms behind a louage, and small destination tiles.

import { Van } from './icons'

export function HeroArt() {
  return (
    <svg viewBox="0 0 400 170" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--bg)" />
          <stop offset="1" stopColor="var(--surface-2)" />
        </linearGradient>
      </defs>
      <rect width="400" height="170" fill="url(#sky)" />
      {/* minaret */}
      <g fill="var(--surface-3)">
        <rect x="292" y="34" width="22" height="104" />
        <rect x="288" y="30" width="30" height="8" />
        <rect x="296" y="14" width="14" height="18" />
        <path d="M299 14 L303 4 L307 14 Z" />
        <rect x="300" y="50" width="6" height="12" rx="3" fill="var(--bg)" />
        <rect x="300" y="80" width="6" height="12" rx="3" fill="var(--bg)" />
      </g>
      {/* white houses with domes and blue doors */}
      <g fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5">
        <rect x="210" y="88" width="62" height="52" />
        <path d="M222 88 a19 19 0 0 1 38 0 Z" />
        <rect x="320" y="96" width="70" height="44" />
        <rect x="150" y="104" width="48" height="36" />
        <path d="M160 104 a14 14 0 0 1 28 0 Z" />
      </g>
      <g fill="#1f5bd8">
        <path d="M234 140 v-18 a7 7 0 0 1 14 0 v18 Z" />
        <path d="M346 140 v-16 a6 6 0 0 1 12 0 v16 Z" />
        <rect x="166" y="114" width="8" height="8" rx="2" />
      </g>
      {/* palms */}
      <g fill="none" stroke="var(--line-strong)" strokeWidth="4" strokeLinecap="round">
        <path d="M60 140 C62 116 64 98 72 80" />
        <path d="M72 80 c-12 -8 -24 -8 -34 0 M72 80 c-4 -12 -14 -18 -26 -16 M72 80 c6 -10 18 -14 28 -9 M72 80 c12 -3 22 3 27 12" />
        <path d="M384 140 C385 122 386 110 390 98" />
        <path d="M390 98 c-9 -6 -18 -6 -26 0 M390 98 c-3 -9 -11 -14 -20 -12" />
      </g>
      {/* road */}
      <rect x="0" y="140" width="400" height="30" fill="var(--surface-3)" />
      <line x1="0" y1="157" x2="400" y2="157" stroke="var(--bg)" strokeWidth="3" strokeDasharray="16 12" />
      <Van x={84} y={70} width={150} />
    </svg>
  )
}

const DEST_STYLES: Record<string, [string, string, 'sea' | 'desert' | 'city']> = {
  Sousse: ['#7cc4f0', '#2a8fd6', 'sea'],
  Monastir: ['#8fd3f5', '#3a9fe0', 'sea'],
  Nabeul: ['#ffd29a', '#f28c3a', 'city'],
  Sfax: ['#c6d8f2', '#5b7fb8', 'city'],
  Djerba: ['#9fe3e6', '#22a6b3', 'sea'],
  Bizerte: ['#a9d6ff', '#3c7fd8', 'sea'],
  Kairouan: ['#f6dcae', '#c8964e', 'desert'],
}

export function DestArt({ city }: { city: string }) {
  const [top, bottom, kind] = DEST_STYLES[city] ?? ['#e6e6e6', '#9a9a9a', 'city']
  const id = `d-${city}`
  return (
    <svg viewBox="0 0 112 84" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="112" height="84" fill={`url(#${id})`} />
      <circle cx="86" cy="22" r="10" fill="#fff4c2" opacity=".9" />
      {kind === 'sea' && (
        <>
          <rect x="0" y="56" width="112" height="28" fill="#fff" opacity=".25" />
          <path d="M0 62 q14 -6 28 0 t28 0 t28 0 t28 0" stroke="#fff" strokeWidth="2" fill="none" opacity=".7" />
        </>
      )}
      {kind === 'desert' && <path d="M0 64 C30 50 60 70 112 56 V84 H0 Z" fill="#e3b46a" />}
      <g fill="#fff">
        <rect x="14" y="40" width="26" height="22" />
        <path d="M18 40 a9 9 0 0 1 18 0 Z" />
        <rect x="44" y="34" width="10" height="28" />
        <path d="M46 34 L49 26 L52 34 Z" />
        <rect x="58" y="46" width="30" height="16" />
      </g>
    </svg>
  )
}
