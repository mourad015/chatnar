import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CoinsProvider } from '@/components/CoinsProvider'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'ChatNar — Tunisia Predicts',
  description: 'Watch Tunisian Kick streamers and predict live moments. Win coins. Be a legend.',
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-brand-black text-white font-body antialiased">
        <CoinsProvider>
          <Navbar />
          <Sidebar />
          <main className="pt-14 pb-20 md:pb-0 md:pl-56 min-h-screen">
            {children}
          </main>
          <BottomNav />
        </CoinsProvider>
      </body>
    </html>
  )
}
