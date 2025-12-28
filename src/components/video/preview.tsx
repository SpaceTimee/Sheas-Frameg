'use client'

import { memo, useRef, useEffect, useCallback } from 'react'
import { EyeOff } from 'lucide-react'

function VideoPreview({
  url,
  isPaused,
  onTogglePlayPause
}: {
  url: string
  isPaused: boolean
  onTogglePlayPause: () => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const videoEl = videoRef.current
    if (videoEl && videoEl.src !== url) {
      videoEl.src = url
    }
  }, [url])

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    if (isPaused) {
      videoEl.pause()
    } else {
      videoEl.play().catch(() => {})
    }
  }, [isPaused])

  const handleTogglePlayPause = useCallback(() => {
    onTogglePlayPause()
  }, [onTogglePlayPause])

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer self-center sm:self-auto"
      onClick={handleTogglePlayPause}
    >
      <video
        ref={videoRef}
        className="h-20 w-32 object-cover rounded-md bg-black"
        playsInline
        loop
        muted
        onLoadedData={(e) => {
          if (!isPaused) {
            e.currentTarget.play().catch(() => {})
          }
        }}
      />
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-md">
          <EyeOff className="h-8 w-8 text-white/80" />
        </div>
      )}
    </div>
  )
}

export default memo(VideoPreview)
