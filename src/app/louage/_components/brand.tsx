// Blassa mark: a lowercase "b" drawn as a reclined seat (backrest + cushion),
// crossed by the red side stripe of a Tunisian louage.

export const SEAT_PATH =
  'M29 19.5 C28.6 16.5 30.9 14 33.9 14 L36.6 14 C39 14 41 15.8 41.3 18.2 L45 47 L61 47 C70.4 47 78 54.6 78 64 C78 73.4 70.4 81 61 81 L40 81 C37 81 34.5 78.8 34.1 75.8 Z'

const STRIPE_RED = '#E70013'

type Props = {
  size?: number
  /** app: black rounded square (app icon). seat: the seat only, no square or stripe. */
  variant?: 'app' | 'seat'
  className?: string
  /** Color of the seat when variant is "seat". */
  color?: string
}

export function BlassaMark({ size = 32, variant = 'app', className, color = '#fff' }: Props) {
  if (variant === 'seat') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
        <path d={SEAT_PATH} fill={color} />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <clipPath id="blassa-sq">
          <rect width="100" height="100" rx="24" />
        </clipPath>
      </defs>
      <g clipPath="url(#blassa-sq)">
        <rect width="100" height="100" fill="#000" />
        <rect y="58" width="100" height="8" fill={STRIPE_RED} />
        {/* black outline keeps a gap between the stripe and the seat */}
        <path d={SEAT_PATH} fill="none" stroke="#000" strokeWidth="6" strokeLinejoin="round" />
        <path d={SEAT_PATH} fill="#fff" />
      </g>
      <rect x=".5" y=".5" width="99" height="99" rx="23.5" fill="none" stroke="rgba(255,255,255,.14)" />
    </svg>
  )
}
