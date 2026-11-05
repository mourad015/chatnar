import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono } from 'next/font/google'
import { BlassaProvider } from './_lib/store'
import { AuthGate } from './_components/auth'
import s from './louage.module.css'

// Brand board type: Inter for UI, IBM Plex Sans Arabic for Arabic.
const display = Inter({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' })
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const arabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '600', '700'], variable: '--font-ar', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['600'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'Blassa — تعرف وين، وقتاش، وقدّاش',
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
