'use client'

import dynamic from 'next/dynamic'
import { LoaderCircle } from 'lucide-react'
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
        <div className="text-muted-foreground flex items-center gap-2">
          <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
          <p>{translate('videoProcessor.loading')}</p>
        </div>
      </div>
    )
  }
})

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col p-4 md:p-8">
        <VideoProcessor />
      </main>
      <Footer />
    </div>
  )
}
