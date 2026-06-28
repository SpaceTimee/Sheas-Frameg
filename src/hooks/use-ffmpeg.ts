'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { toast } from '@/hooks/use-toast'
import { useLanguage } from '@/lib/i18n/provider'

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false)
  const { translate } = useLanguage()
  const translateRef = useRef(translate)

  useEffect(() => {
    translateRef.current = translate
  }, [translate])

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current?.loaded) {
      setIsFFmpegLoaded(true)
      return
    }

    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const ffmpegInstance = new FFmpeg()
      await ffmpegInstance.load()
      ffmpegRef.current = ffmpegInstance
      setIsFFmpegLoaded(true)
    } catch {
      ffmpegRef.current = null
      setIsFFmpegLoaded(false)
      toast({
        variant: 'destructive',
        title: translateRef.current('toast.ffmpegLoadFailed.title'),
        description: translateRef.current('toast.ffmpegLoadFailed.description')
      })
    }
  }, [])

  useEffect(() => {
    const loadFFmpegTimeoutId = setTimeout(() => {
      void loadFFmpeg()
    }, 0)

    return () => {
      clearTimeout(loadFFmpegTimeoutId)
      ffmpegRef.current?.terminate()
      ffmpegRef.current = null
    }
  }, [loadFFmpeg])

  const resetFFmpeg = useCallback(async () => {
    ffmpegRef.current?.terminate()
    ffmpegRef.current = null
    setIsFFmpegLoaded(false)
    await loadFFmpeg()
  }, [loadFFmpeg])

  return { ffmpegRef, isFFmpegLoaded, resetFFmpeg }
}
