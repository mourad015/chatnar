// Mock data until Supabase + Kick are wired up.
// To show a real stream, set `kick` to the streamer's Kick channel slug (with their OK).

export type Category = { id: string; label: string; emoji: string }

export const CATEGORIES: Category[] = [
  { id: 'free-fire',    label: 'Free Fire',     emoji: '🔥' },
  { id: 'fc',           label: 'FC 26',         emoji: '⚽' },
  { id: 'chatting',     label: 'Just Chatting', emoji: '💬' },
  { id: 'chkobba',      label: 'Chkobba',       emoji: '🃏' },
  { id: 'rap',          label: 'Rap Tounsi',    emoji: '🎤' },
  { id: 'valorant',     label: 'Valorant',      emoji: '🎯' },
  { id: 'irl',          label: 'IRL Tunis',     emoji: '📍' },
  { id: 'watch-along',  label: 'Derby Watch',   emoji: '🏟️' },
]

export type Streamer = {
  slug: string
  name: string
  city: string
  category: string
  title: string
  viewers: number
  followers: number
  hue: number
  live: boolean
  kick?: string
}

export const STREAMERS: Streamer[] = [
  { slug: 'wled-lhouma',   name: 'WledLhouma',    city: 'Tunis',    category: 'free-fire',   title: 'Ranked till Booyah or till Fajr 😤',           viewers: 4210, followers: 182000, hue: 14,  live: true },
  { slug: 'sfaxi-gamer',   name: 'SfaxiGamer',    city: 'Sfax',     category: 'fc',          title: 'Weekend League — no rage quit (inchallah)',    viewers: 2870, followers: 96000,  hue: 200, live: true },
  { slug: 'marsa-queen',   name: 'MarsaQueen',    city: 'La Marsa', category: 'chatting',    title: 'Storytime + your worst taxi stories',          viewers: 1950, followers: 74000,  hue: 320, live: true },
  { slug: 'bizerta-boss',  name: 'BizertaBoss',   city: 'Bizerte',  category: 'watch-along', title: 'DERBY WATCH-ALONG 🔴🟡 vs 🔴⚪',                 viewers: 6340, followers: 210000, hue: 0,   live: true },
  { slug: 'kairouan-kid',  name: 'KairouanKid',   city: 'Kairouan', category: 'chkobba',     title: 'Chkobba vs chat — 50 coins a hand',            viewers: 980,  followers: 31000,  hue: 45,  live: true },
  { slug: 'djerba-vibes',  name: 'DjerbaVibes',   city: 'Djerba',   category: 'irl',         title: 'Night walk in Houmt Souk 🌙',                  viewers: 1320, followers: 58000,  hue: 175, live: true },
  { slug: 'sousse-sniper', name: 'SousseSniper',  city: 'Sousse',   category: 'valorant',    title: 'Immortal push with the boys',                  viewers: 760,  followers: 27000,  hue: 265, live: true },
  { slug: 'mc-nabeul',     name: 'MC_Nabeul',     city: 'Nabeul',   category: 'rap',         title: 'Freestyle on your words — drop them in chat', viewers: 1140, followers: 44000,  hue: 90,  live: true },
]

export type PredictionOption = { label: string; pool: number }

export type Prediction = {
  id: string
  streamer: string
  question: string
  options: [PredictionOption, PredictionOption]
  secondsLeft: number
  status: 'open' | 'resolved'
  winner?: 0 | 1
}

export const PREDICTIONS: Prediction[] = [
  { id: 'p1', streamer: 'bizerta-boss',  question: 'Goal before the 60th minute?',              options: [{ label: 'YES', pool: 48200 }, { label: 'NO', pool: 31900 }], secondsLeft: 214, status: 'open' },
  { id: 'p2', streamer: 'wled-lhouma',   question: 'Booyah this match?',                         options: [{ label: 'YES', pool: 22100 }, { label: 'NO', pool: 30400 }], secondsLeft: 95,  status: 'open' },
  { id: 'p3', streamer: 'sfaxi-gamer',   question: 'Wins this Weekend League game?',             options: [{ label: 'WIN', pool: 15800 }, { label: 'LOSE', pool: 9100 }], secondsLeft: 340, status: 'open' },
  { id: 'p4', streamer: 'kairouan-kid',  question: 'Beats chat in this Chkobba round?',          options: [{ label: 'YES', pool: 6400 },  { label: 'NO', pool: 7900 }],  secondsLeft: 58,  status: 'open' },
  { id: 'p5', streamer: 'marsa-queen',   question: 'Chat hits 2,500 viewers before midnight?',   options: [{ label: 'YES', pool: 11300 }, { label: 'NO', pool: 4200 }],  secondsLeft: 1260, status: 'open' },
  { id: 'p6', streamer: 'mc-nabeul',     question: 'Finishes the freestyle without stopping?',   options: [{ label: 'YES', pool: 5200 },  { label: 'NO', pool: 6100 }],  secondsLeft: 150, status: 'open' },
  { id: 'p7', streamer: 'sousse-sniper', question: 'Ace this round?',                            options: [{ label: 'YES', pool: 2100 },  { label: 'NO', pool: 8800 }],  secondsLeft: 40,  status: 'open' },
  { id: 'p8', streamer: 'djerba-vibes',  question: 'Finds a brik stand still open?',             options: [{ label: 'YES', pool: 7400 },  { label: 'NO', pool: 2600 }],  secondsLeft: 480, status: 'open' },
  { id: 'r1', streamer: 'wled-lhouma',   question: 'Top 3 last match?',                          options: [{ label: 'YES', pool: 19000 }, { label: 'NO', pool: 14000 }], secondsLeft: 0,   status: 'resolved', winner: 0 },
  { id: 'r2', streamer: 'bizerta-boss',  question: 'Yellow card in the first half?',             options: [{ label: 'YES', pool: 26000 }, { label: 'NO', pool: 12000 }], secondsLeft: 0,   status: 'resolved', winner: 1 },
]

export type Predictor = { name: string; city: string; coins: number; streak: number; accuracy: number; hue: number }

export const LEADERBOARD: Predictor[] = [
  { name: 'Yassine_TN',    city: 'Tunis',    coins: 284300, streak: 9, accuracy: 71, hue: 14 },
  { name: 'Mimi.Sfax',     city: 'Sfax',     coins: 251900, streak: 6, accuracy: 68, hue: 320 },
  { name: 'Rayen9',        city: 'Ariana',   coins: 219450, streak: 4, accuracy: 66, hue: 200 },
  { name: 'Aziz_Bizerte',  city: 'Bizerte',  coins: 187200, streak: 3, accuracy: 63, hue: 0 },
  { name: 'Nour.TN',       city: 'Monastir', coins: 166800, streak: 5, accuracy: 64, hue: 175 },
  { name: 'Hamza_Sousse',  city: 'Sousse',   coins: 149300, streak: 2, accuracy: 61, hue: 265 },
  { name: 'Eya.Nabeul',    city: 'Nabeul',   coins: 133700, streak: 1, accuracy: 60, hue: 90 },
  { name: 'Skander07',     city: 'Tunis',    coins: 12450,  streak: 2, accuracy: 58, hue: 20 },
  { name: 'Oussama_Gabes', city: 'Gabès',    coins: 118900, streak: 0, accuracy: 57, hue: 45 },
  { name: 'Lina.Djerba',   city: 'Djerba',   coins: 104200, streak: 3, accuracy: 59, hue: 150 },
].sort((a, b) => b.coins - a.coins)

export const CURRENT_USER = 'Skander07'

export function getStreamer(slug: string) {
  return STREAMERS.find(s => s.slug === slug)
}

export function getCategory(id: string) {
  return CATEGORIES.find(c => c.id === id)
}

export function predictionsFor(slug: string) {
  return PREDICTIONS.filter(p => p.streamer === slug)
}

export function openPredictions() {
  return PREDICTIONS.filter(p => p.status === 'open')
}

export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

export function formatCoins(n: number) {
  return n.toLocaleString('en-US')
}
