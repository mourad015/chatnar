'use client'

import { useState } from 'react'
import { Check, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VIP_PLANS, PAYMENT_METHODS, formatPrice, type VipPlan } from '@/lib/vip'

export default function VipCheckout() {
  const [planId, setPlanId] = useState<VipPlan['id']>('quarterly')
  const [methodId, setMethodId] = useState(PAYMENT_METHODS[0].id)

  const plan = VIP_PLANS.find(p => p.id === planId)!
  const method = PAYMENT_METHODS.find(m => m.id === methodId)!

  return (
    <div className="flex flex-col gap-6">

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VIP_PLANS.map(p => (
          <button
            key={p.id}
            onClick={() => setPlanId(p.id)}
            className={cn(
              'relative text-left p-4 rounded-card border bg-brand-card transition-all',
              p.id === planId ? 'border-brand-gold shadow-gold' : 'border-brand-border hover:border-brand-muted',
            )}
          >
            {p.tag && (
              <span className="absolute top-3 right-3 text-[10px] font-extrabold bg-brand-gold text-black px-2 py-0.5 rounded">
                {p.tag}
              </span>
            )}
            <div className="text-sm text-brand-muted font-semibold">{p.name}</div>
            <div className="font-display text-3xl text-white mt-1">{formatPrice(p, method.currency)}</div>
            <div className="text-xs text-brand-muted mt-1">
              {p.months === 1 ? 'Billed every month' : `Billed every ${p.months} months`}
            </div>
          </button>
        ))}
      </div>

      {/* Payment methods */}
      <div>
        <div className="text-xs text-brand-muted uppercase tracking-wider font-bold mb-2">Pay with</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMethodId(m.id)}
              className={cn(
                'flex items-center justify-between gap-3 p-3 rounded-card border bg-brand-card text-left transition-all',
                m.id === methodId ? 'border-brand-orange' : 'border-brand-border hover:border-brand-muted',
              )}
            >
              <div>
                <div className="text-sm font-semibold text-white">{m.name}</div>
                <div className="text-xs text-brand-muted">{m.hint}</div>
              </div>
              {m.id === methodId && <Check className="w-4 h-4 text-brand-orange shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* CTA — payments aren't wired up yet */}
      <div>
        <button
          disabled
          className="btn-orange w-full py-3 text-sm flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
        >
          <Crown className="w-4 h-4" />
          GET {plan.name.toUpperCase()} · {formatPrice(plan, method.currency)}
        </button>
        <p className="text-xs text-brand-muted text-center mt-2">
          Payments coming soon. Cancel anytime.
        </p>
      </div>
    </div>
  )
}
