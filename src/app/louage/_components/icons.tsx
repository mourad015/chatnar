export {
  ArrowRight,
  ArrowUpDown,
  BadgeCheck,
  Bell,
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
