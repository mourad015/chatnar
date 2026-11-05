// VIP only sells cosmetics and comfort. It never gives coins or anything
// that helps win predictions, so paying can't buy an edge on prizes.

export type VipPlan = {
  id: 'monthly' | 'quarterly'
  name: string
  months: number
  priceTnd: number
  priceEur: number
  tag?: string
}

// Launch prices — adjust once we test what people will pay.
export const VIP_PLANS: VipPlan[] = [
  { id: 'monthly',   name: 'VIP 1 Month',  months: 1, priceTnd: 9.9,  priceEur: 2.99 },
  { id: 'quarterly', name: 'VIP 3 Months', months: 3, priceTnd: 24.9, priceEur: 7.49, tag: 'SAVE 16%' },
]

export type VipPerk = {
  label: string
  free: boolean | string
  vip: boolean | string
}

export const VIP_PERKS: VipPerk[] = [
  { label: 'Watch streams & predict',      free: true,      vip: true },
  { label: 'Daily chest',                  free: true,      vip: true },
  { label: 'VIP badge in chat',            free: false,     vip: true },
  { label: 'Name color in chat',           free: false,     vip: '8 colors' },
  { label: 'Exclusive Tunisian emotes',    free: false,     vip: true },
  { label: 'Animated avatar frame',        free: false,     vip: true },
  { label: 'Saved clips',                  free: '5',       vip: 'Unlimited' },
  { label: 'No ads',                       free: false,     vip: true },
  { label: 'Early access to new features', free: false,     vip: true },
]

export type PaymentMethod = {
  id: string
  name: string
  hint: string
  currency: 'TND' | 'EUR'
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'phone',   name: 'Phone credit',  hint: 'Ooredoo · Orange · Tunisie Telecom', currency: 'TND' },
  { id: 'flouci',  name: 'Flouci',        hint: 'Mobile wallet',                      currency: 'TND' },
  { id: 'd17',     name: 'D17',           hint: 'La Poste Tunisienne',                currency: 'TND' },
  { id: 'card_tn', name: 'Tunisian card', hint: 'Via Konnect',                        currency: 'TND' },
  { id: 'card_eu', name: 'Card abroad',   hint: 'Tunisians outside Tunisia',          currency: 'EUR' },
]

export function formatPrice(plan: VipPlan, currency: 'TND' | 'EUR') {
  return currency === 'TND'
    ? `${plan.priceTnd.toFixed(3).replace('.', ',')} DT`
    : `€${plan.priceEur.toFixed(2)}`
}
