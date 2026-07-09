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
      className="ring-offset-background focus-visible:ring-ring relative shrink-0 cursor-pointer self-center rounded-md border-none bg-transparent p-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:self-auto"
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
        className="h-20 w-32 rounded-md bg-black object-cover"
        aria-hidden="true"
        tabIndex={-1}
        onLoadedData={(loadedDataEvent) => {
          if (!isPaused) void loadedDataEvent.currentTarget.play().catch(() => {})
        }}
      />
      {isPaused && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        >
          <EyeOff className="size-8 text-white/80" />
        </div>
      )}
    </button>
  )
}

export default memo(VideoPreview)
