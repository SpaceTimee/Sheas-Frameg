import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_SC } from 'next/font/google'
import type { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { site } from '@/lib/consts'
import { LanguageProvider } from '@/lib/i18n/provider'

const interFont = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const notoSansScFont = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sc',
  preload: false
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.author.url }],
  keywords: ['video', 'interpolation', 'frame', 'ffmpeg', 'sheas', 'frameg'],
  openGraph: {
    title: site.name,
    description: site.description,
    type: 'website',
    url: site.url,
    siteName: site.name,
    locale: 'en_US'
  }
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: site.themeColor
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`selection:bg-primary/20 selection:text-primary font-sans antialiased ${interFont.variable} ${notoSansScFont.variable}`}
      >
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
