'use client'

import { createContext, useCallback, useContext, useState, useSyncExternalStore } from 'react'

// Local-only wallet until accounts exist. Coins are free-to-earn and never bought.

type Pick = { option: 0 | 1; amount: number }
type Toast = { id: number; text: string; tone: 'ok' | 'warn' }

type CoinsCtx = {
  coins: number
  picks: Record<string, Pick>
  chestReady: boolean
  claimChest: () => void
  placePick: (predictionId: string, option: 0 | 1, amount: number) => boolean
  toast: (text: string, tone?: Toast['tone']) => void
}

const Ctx = createContext<CoinsCtx | null>(null)

const START_COINS = 12450
const CHEST_REWARD = 100
const KEY = 'chatnar.wallet.v1'

type Wallet = { coins: number; picks: Record<string, Pick>; chestDay: string | null; ready: boolean }

function today() {
  return new Date().toISOString().slice(0, 10)
}

// Tiny external store over localStorage, read through useSyncExternalStore.
const SERVER_WALLET: Wallet = { coins: START_COINS, picks: {}, chestDay: null, ready: false }
let wallet: Wallet | null = null
const listeners = new Set<() => void>()

function readWallet(): Wallet {
  if (!wallet) {
    let saved: Partial<Wallet> | null = null
    try {
      const raw = localStorage.getItem(KEY)
      saved = raw ? JSON.parse(raw) : null
    } catch {
      saved = null
    }
    wallet = { ...SERVER_WALLET, ...saved, ready: true }
  }
  return wallet
}

function writeWallet(update: (w: Wallet) => Wallet) {
  wallet = update(readWallet())
  try {
    const { coins, picks, chestDay } = wallet
    localStorage.setItem(KEY, JSON.stringify({ coins, picks, chestDay }))
  } catch {
    // storage blocked — wallet just won't persist
  }
  listeners.forEach(l => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function CoinsProvider({ children }: { children: React.ReactNode }) {
  const { coins, picks, chestDay, ready } = useSyncExternalStore(subscribe, readWallet, () => SERVER_WALLET)
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, text, tone }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600)
  }, [])

  const chestReady = ready && chestDay !== today()

  const claimChest = useCallback(() => {
    if (readWallet().chestDay === today()) return
    writeWallet(w => ({ ...w, chestDay: today(), coins: w.coins + CHEST_REWARD }))
    toast(`+${CHEST_REWARD} coins! See you tomorrow 🎁`)
  }, [toast])

  const placePick = useCallback((predictionId: string, option: 0 | 1, amount: number) => {
    const w = readWallet()
    if (w.picks[predictionId]) return false
    if (amount <= 0 || amount > w.coins) {
      toast('Not enough coins — grab your daily chest', 'warn')
      return false
    }
    writeWallet(x => ({ ...x, coins: x.coins - amount, picks: { ...x.picks, [predictionId]: { option, amount } } }))
    toast('Locked in. Yalla! 🔥')
    return true
  }, [toast])

  return (
    <Ctx.Provider value={{ coins, picks, chestReady, claimChest, placePick, toast }}>
      {children}
      <div className="fixed z-[60] bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast-in px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg border ${
              t.tone === 'ok'
                ? 'bg-brand-card border-brand-orange text-white'
                : 'bg-brand-card border-brand-red text-white'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useCoins() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCoins must be used inside CoinsProvider')
  return ctx
}
