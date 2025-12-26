import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from '@/lib/i18n/provider'

export const metadata: Metadata = {
  title: 'Sheas Frameg',
  description: 'Just Interpolate It',
  applicationName: 'Sheas Frameg',
  authors: [{ name: 'Space Time', url: 'https://www.spacetimee.xyz' }],
  keywords: ['video', 'interpolation', 'frame', 'ffmpeg', 'sheas', 'frameg'],
  openGraph: {
    title: 'Sheas Frameg',
    description: 'Just Interpolate It',
    type: 'website',
    siteName: 'Sheas Frameg',
    locale: 'en_US'
  }
}

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-body antialiased ${inter.className}`}>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  )
}
