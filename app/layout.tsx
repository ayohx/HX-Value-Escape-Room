import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Holiday Extras Arcade Escape Room',
  description: 'An interactive experience exploring the five Holiday Extras values through puzzle-solving',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className={nunito.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
