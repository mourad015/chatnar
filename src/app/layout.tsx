import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChatNar — Tunisia Predicts',
  description: 'Watch Tunisian Kick streamers and predict live moments. Win coins. Be a legend.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-brand-black text-white font-body antialiased">
        {children}
      </body>
    </html>
  )
}