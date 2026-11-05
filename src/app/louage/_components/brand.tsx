// Blassa brand: the B + pin + louage mark (from the brand board) and the
// italic wordmark with its red swoosh.

import mark128 from '../_assets/mark-128.png'
import mark256 from '../_assets/mark-256.png'

type Img = string | { src: string }
const srcOf = (m: Img) => (typeof m === 'string' ? m : m.src)

export const TAGLINE_AR = 'تعرف وين، وقتاش، وقدّاش.'

export function BlassaMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static logo, also used in the standalone build
    <img
      src={srcOf(size > 96 ? mark256 : mark128)}
      width={size}
      height={size}
      alt=""
      className={className}
      style={{ borderRadius: size * 0.22, background: '#fff', display: 'block', flex: 'none' }}
    />
  )
}

/** "Blassa" in heavy italic with the red swoosh underneath. */
export function Wordmark({ size = 24, light }: { size?: number; light?: boolean }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: 'var(--font-display), sans-serif',
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize: size,
        letterSpacing: '-0.045em',
        lineHeight: 1,
        paddingBottom: size * 0.22,
        color: light ? '#fff' : 'var(--ink)',
      }}
    >
      Blassa
      <svg
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        aria-hidden
        style={{ position: 'absolute', left: '38%', right: '-2%', bottom: 0, width: '64%', height: size * 0.2 }}
      >
        <path d="M0 9 C30 1 70 0 100 3 C70 3 35 5 0 9 Z" fill="var(--red)" />
      </svg>
    </span>
  )
}
