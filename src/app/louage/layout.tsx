import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, JetBrains_Mono, Readex_Pro } from 'next/font/google'
import { BlassaProvider } from './_lib/store'
import { TabBar } from './_components/ui'
import s from './louage.module.css'

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const body = Readex_Pro({ subsets: ['latin', 'arabic'], variable: '--font-body', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['600'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'Blassa — Chouf el louage 9bal ma temchi',
  description: 'Blayes fergha, prix w départs mta3 el louage fi Tounes, live.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3eee4' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0d0b' },
  ],
}

export default function LouageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${s.app} ${display.variable} ${body.variable} ${mono.variable}`}>
      <BlassaProvider>
        <div className={s.shell}>{children}</div>
        <TabBar />
      </BlassaProvider>
    </div>
  )
}
