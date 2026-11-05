import type { Metadata } from 'next'
import { Check, Crown, Minus } from 'lucide-react'
import VipCheckout from '@/components/VipCheckout'
import { VIP_PERKS, type VipPerk } from '@/lib/vip'

export const metadata: Metadata = {
  title: 'VIP — ChatNar',
  description: 'Stand out in chat with a VIP badge, name colors, Tunisian emotes and no ads.',
}

function PerkValue({ value }: { value: VipPerk['free'] }) {
  if (value === true) return <Check className="w-4 h-4 text-brand-green mx-auto" />
  if (value === false) return <Minus className="w-4 h-4 text-brand-muted mx-auto" />
  return <span className="text-xs font-semibold text-white">{value}</span>
}

export default function VipPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-10">

      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold flex items-center justify-center shadow-gold">
          <Crown className="w-7 h-7 text-brand-gold" />
        </div>
        <h1 className="font-display text-5xl leading-none">
          <span className="text-white">CHATNAR </span>
          <span className="text-brand-gold">VIP</span>
        </h1>
        <p className="text-brand-muted max-w-md">
          Stand out in chat, unlock Tunisian emotes and watch with no ads.
        </p>
      </section>

      {/* Checkout */}
      <section>
        <VipCheckout />
      </section>

      {/* Free vs VIP */}
      <section>
        <h2 className="font-display text-2xl text-white mb-3">FREE VS VIP</h2>
        <div className="chatnar-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-xs uppercase tracking-wider">
                <th className="text-left font-bold text-brand-muted p-3">Perk</th>
                <th className="font-bold text-brand-muted p-3 w-20">Free</th>
                <th className="font-bold text-brand-gold p-3 w-24">VIP</th>
              </tr>
            </thead>
            <tbody>
              {VIP_PERKS.map(perk => (
                <tr key={perk.label} className="border-b border-brand-border last:border-0">
                  <td className="p-3 text-white">{perk.label}</td>
                  <td className="p-3 text-center"><PerkValue value={perk.free} /></td>
                  <td className="p-3 text-center"><PerkValue value={perk.vip} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fair play note */}
      <section className="chatnar-card p-4 text-sm text-brand-muted">
        <span className="text-white font-semibold">Fair play: </span>
        VIP never gives coins or any edge in predictions. Everyone earns coins the same way,
        and leaderboard prizes depend only on how well you predict.
      </section>
    </div>
  )
}
