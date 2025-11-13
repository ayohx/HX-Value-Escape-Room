import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en-GB">
      <body className="font-sans">{children}</body>
    </html>
  )
}


