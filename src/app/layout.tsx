import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from '@/lib/i18n/provider'

const inter = Inter({ subsets: ['latin'] })

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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased ${inter.className}`}>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  )
}
