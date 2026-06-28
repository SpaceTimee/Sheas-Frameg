'use client'

import { memo, useEffect, useRef } from 'react'
import { EyeOff } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/provider'

interface VideoPreviewProps {
  videoUrl: string
  isPaused: boolean
  onTogglePlayPause: () => void
}

function VideoPreview({ videoUrl, isPaused, onTogglePlayPause }: VideoPreviewProps) {
  const { translate } = useLanguage()
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isPaused) {
      videoElement.pause()
      return
    }

    void videoElement.play().catch(() => {})
  }, [isPaused])

  return (
    <button
      type="button"
      className="relative shrink-0 cursor-pointer self-center rounded-md border-none bg-transparent p-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:self-auto"
      aria-label={translate(isPaused ? 'videoPreview.playAriaLabel' : 'videoPreview.pauseAriaLabel')}
      onClick={onTogglePlayPause}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        loop
        muted
        preload="metadata"
        className="h-20 w-32 object-cover rounded-md bg-black"
        aria-hidden="true"
        tabIndex={-1}
        onLoadedData={(loadedDataEvent) => {
          if (!isPaused) void loadedDataEvent.currentTarget.play().catch(() => {})
        }}
      />
      {isPaused && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-md"
          aria-hidden="true"
        >
          <EyeOff className="h-8 w-8 text-white/80" />
        </div>
      )}
    </button>
  )
}

export default memo(VideoPreview)
