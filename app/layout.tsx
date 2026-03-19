import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import Script from 'next/script'
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
      <body className="font-sans">
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8QSGMHDZHE"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8QSGMHDZHE');
          `}
        </Script>
      </body>
    </html>
  )
}
