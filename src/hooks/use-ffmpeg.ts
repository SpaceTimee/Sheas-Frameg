import { useRef, useEffect, useCallback, useState } from 'react'
import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { toast } from '@/hooks/use-toast'
import { useLanguage } from '@/lib/i18n/provider'

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { t } = useLanguage()
  const tRef = useRef(t)

  useEffect(() => {
    tRef.current = t
  }, [t])

  const load = useCallback(async () => {
    if (ffmpegRef.current?.loaded) {
      setIsLoaded(true)
      return
    }

    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const ffmpeg = new FFmpeg()
      ffmpeg.on('log', () => {})
      await ffmpeg.load()
      ffmpegRef.current = ffmpeg
      setIsLoaded(true)
    } catch (error) {
      ffmpegRef.current = null
      setIsLoaded(false)
      toast({
        variant: 'destructive',
        title: tRef.current('toast.ffmpegLoadFailed.title'),
        description: tRef.current('toast.ffmpegLoadFailed.description')
      })
    }
  }, [])

  useEffect(() => {
    load()
    return () => {
      ffmpegRef.current?.terminate()
      setIsLoaded(false)
    }
  }, [load])

  const reset = useCallback(async () => {
    if (ffmpegRef.current) {
      ffmpegRef.current.terminate()
      ffmpegRef.current = null
      setIsLoaded(false)
    }
    await load()
  }, [load])

  return { ffmpegRef, isLoaded, reset }
}
