export {
  Package,
  Armchair,
  Bell as BellIcon,
  CalendarDays,
  Car,
  FileText,
  Flag,
  Globe,
  Heart,
  House,
  Info,
  LifeBuoy,
  RefreshCw,
  Settings,
  Share2,
  Shield,
  SlidersHorizontal,
  ArrowRight,
  ArrowUpDown,
  BadgeCheck,
  Bell,
  Bus,
  CarTaxiFront,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Copy,
  TramFront,
  Check,
  Clock,
  Gift,
  LoaderCircle,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'

/** Lucide has no steering wheel, so we draw one in the same style. */
export function SteeringWheel({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="13" r="2" />
      <path d="M3.5 10.5c2.5-.7 5.3-1 8.5-1s6 .3 8.5 1" />
      <path d="M10.3 14.4 7 20" />
      <path d="M13.7 14.4 17 20" />
    </svg>
  )
}

/** Side view of a Tunisian louage: white van, side stripe (red = interurbain, blue = régional). */
export function Van({ width = 60, stripe = 'red', x, y }: { width?: number; stripe?: 'red' | 'blue'; x?: number; y?: number }) {
  return (
    <svg x={x} y={y} width={width} height={(width * 34) / 64} viewBox="0 0 64 34" aria-hidden>
      <path
        d="M6 5.5h37.5c3 0 5 .9 7 2.9l7.4 7.4c1.2 1.2 2.1 2.6 2.1 4.4v5.3c0 1.5-1.1 2.5-2.6 2.5H5.4C3.9 28 2.5 27 2.5 25.5V9c0-2 1.5-3.5 3.5-3.5z"
        fill="var(--van)"
        stroke="var(--van-line)"
        strokeWidth="1.3"
      />
      <path d="M44 9h4.6c.8 0 1.5.3 2 .9l5.6 6.1H44z" fill="var(--van-glass)" />
      {[6.5, 16.5, 26.5].map((x) => (
        <rect key={x} x={x} y="9" width="8.5" height="7" rx="1.4" fill="var(--van-glass)" />
      ))}
      <rect x="36.5" y="9" width="5.5" height="7" rx="1.2" fill="var(--van-glass)" />
      <rect x="2.6" y="19" width="57.8" height="3.2" fill={stripe === 'blue' ? 'var(--blue)' : 'var(--red)'} />
      <rect x="57.5" y="17.5" width="2.6" height="1.6" rx=".8" fill="#f5b400" />
      {[15, 47].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="28" r="4.6" fill="var(--van-line)" />
          <circle cx={cx} cy="28" r="1.8" fill="#9a9a9a" />
        </g>
      ))}
    </svg>
  )
}
