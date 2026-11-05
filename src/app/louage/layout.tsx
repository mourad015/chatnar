import type { Metadata, Viewport } from 'next'
import { Figtree, JetBrains_Mono, Readex_Pro } from 'next/font/google'
import { BlassaProvider } from './_lib/store'
import { AuthGate } from './_components/auth'
import s from './louage.module.css'

// One family for UI and headings (ride-app style), Readex Pro for Arabic.
const display = Figtree({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const body = Figtree({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const arabic = Readex_Pro({ subsets: ['arabic'], variable: '--font-ar', display: 'swap' })
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
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function LouageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-blassa-root className={`${s.app} ${display.variable} ${body.variable} ${arabic.variable} ${mono.variable}`}>
      <BlassaProvider>
        <AuthGate>{children}</AuthGate>
      </BlassaProvider>
    </div>
  )
}
