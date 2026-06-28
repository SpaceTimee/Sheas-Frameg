'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { useLanguage } from '@/lib/i18n/provider'

const VideoProcessor = dynamic(() => import('@/components/video/video-processor'), {
  ssr: false,
  loading: function VideoProcessorLoading() {
    const { translate } = useLanguage()

    return (
      <div
        role="status"
        className="flex flex-1 flex-col items-center justify-center"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          <p>{translate('videoProcessor.loading')}</p>
        </div>
      </div>
    )
  }
})

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex flex-1 flex-col">
        <VideoProcessor />
      </main>
      <Footer />
    </div>
  )
}
