'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

const VideoProcessor = dynamic(() => import('@/components/video/processor'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p>Loading Video Processor...</p>
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex flex-1 flex-col">
        <VideoProcessor />
      </main>
      <Footer />
    </div>
  )
}
