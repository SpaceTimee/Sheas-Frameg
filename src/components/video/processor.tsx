'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { toast } from '@/hooks/use-toast'
import { useLanguage } from '@/lib/i18n/provider'
import { getVideoInfo, processVideo } from '@/lib/video-utils'
import { useFFmpeg } from '@/hooks/use-ffmpeg'
import JobCard from './job-card'
import QueueCard from './queue-card'
import type { SelectedFile, VideoFile } from '@/types/video'

export default function VideoProcessor() {
  const { t } = useLanguage()
  const [videos, setVideos] = useState<Map<string, VideoFile>>(new Map())
  const [selectedFiles, setSelectedFiles] = useState<Map<string, SelectedFile>>(new Map())
  const [interpolationFactor, setInterpolationFactor] = useState<number>(2)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { ffmpegRef, isLoaded: isFFmpegLoaded, reset: resetFFmpeg } = useFFmpeg()

  const currentProcessingId = useRef<string | null>(null)
  const cancellationRef = useRef(false)
  const [isArrowGlowing, setIsArrowGlowing] = useState(false)
  const [isJobCardOpen, setIsJobCardOpen] = useState(true)

  const videosArray = useMemo(() => Array.from(videos.values()), [videos])
  const selectedFilesArray = useMemo(() => Array.from(selectedFiles.values()), [selectedFiles])
  const isProcessing = useMemo(() => videosArray.some((v) => v.status === 'processing'), [videosArray])

  useEffect(() => {
    if (isArrowGlowing) {
      const timer = setTimeout(() => {
        setIsArrowGlowing(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isArrowGlowing])

  const handleFileChange = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return

      const videoFiles = [...files].filter((file) => {
        if (file.type.startsWith('video/')) return true
        toast({
          variant: 'destructive',
          title: t('toast.invalidFileType.title'),
          description: t('toast.invalidFileType.description', {
            fileName: file.name
          })
        })
        return false
      })

      if (videoFiles.length === 0) {
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      const newFiles: SelectedFile[] = videoFiles.map((file) => {
        const id = crypto.randomUUID()
        return {
          id,
          file,
          previewUrl: URL.createObjectURL(file),
          isPaused: false
        }
      })

      const newFilesMap = new Map(newFiles.map((file) => [file.id, file] as const))

      setSelectedFiles((prev) => new Map([...prev, ...newFilesMap]))

      if (fileInputRef.current) fileInputRef.current.value = ''

      const results = await Promise.allSettled(newFiles.map((file) => getVideoInfo(file.id, file.file)))

      setSelectedFiles((prev) => {
        const next = new Map(prev)
        results.forEach((result, index) => {
          const selectedFile = newFiles[index]
          if (!selectedFile) return
          const originalFile = next.get(selectedFile.id)
          if (!originalFile) return

          if (result.status === 'fulfilled') {
            const { duration, fps } = result.value
            next.set(selectedFile.id, { ...originalFile, duration, fps })
          } else {
            toast({
              variant: 'destructive',
              title: t('toast.errorReadingFile.title', {
                fileName: originalFile.file.name
              }),
              description: t('toast.errorReadingFile.description')
            })
            next.set(selectedFile.id, { ...originalFile, error: true })
          }
        })
        return next
      })
    },
    [t]
  )

  const handleAddToQueue = useCallback(() => {
    const validFiles = selectedFilesArray.filter((file) => !file.error)

    if (validFiles.length === 0) {
      toast({
        variant: 'destructive',
        title: t('toast.noFilesSelected.title'),
        description: t('toast.noFilesSelected.description')
      })
      return
    }

    cancellationRef.current = false
    setIsArrowGlowing(true)

    const newVideos: VideoFile[] = validFiles.map((selectedFile) => ({
      id: crypto.randomUUID(),
      file: selectedFile.file,
      factor: interpolationFactor,
      status: 'queued',
      progress: 0,
      originalUrl: selectedFile.previewUrl,
      isPaused: false,
      duration: selectedFile.duration,
      fps: selectedFile.fps
    }))

    setVideos((prev) => new Map([...prev, ...newVideos.map((v) => [v.id, v] as const)]))

    setSelectedFiles(new Map())
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [selectedFilesArray, interpolationFactor, t])

  const updateVideo = useCallback((id: string, updates: Partial<VideoFile>) => {
    setVideos((currentItems) => {
      const newItems = new Map(currentItems)
      const item = newItems.get(id)
      if (!item) return currentItems
      newItems.set(id, { ...item, ...updates })
      return newItems
    })
  }, [])

  useEffect(() => {
    if (!isFFmpegLoaded || isProcessing) return

    const timeoutId = setTimeout(() => {
      const nextVideo = videosArray.find((v) => v.status === 'queued' && v.duration && v.fps)
      if (!nextVideo || !ffmpegRef.current) return

      currentProcessingId.current = nextVideo.id
      cancellationRef.current = false

      const onProgress = ({ time }: { time: number }) => {
        if (currentProcessingId.current !== nextVideo.id) return
        const timeInSeconds = time / 1_000_000

        if (nextVideo.duration) {
          const progressPercentage = (timeInSeconds / nextVideo.duration) * 100
          updateVideo(nextVideo.id, {
            progress: Math.min(progressPercentage, 100)
          })
        }
      }

      processVideo(ffmpegRef.current, nextVideo, updateVideo, cancellationRef, onProgress).finally(() => {
        if (currentProcessingId.current === nextVideo.id) currentProcessingId.current = null
      })
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [isFFmpegLoaded, isProcessing, videosArray, updateVideo, ffmpegRef])

  useEffect(() => {
    const videosToUpdate = videosArray.filter((video) => {
      return video.status === 'queued' && (!video.duration || !video.fps)
    })

    if (videosToUpdate.length === 0) return

    const fetchAndUpdateMetadata = async () => {
      const infoPromises = videosToUpdate.map((video) =>
        getVideoInfo(video.id, video.file).catch(() => ({
          id: video.id,
          error: true as const,
          duration: 0,
          fps: 0
        }))
      )

      const results = await Promise.all(infoPromises)

      results.forEach((result) => {
        if ('error' in result && result.error) {
          updateVideo(result.id, {
            status: 'error',
            error: {
              type: 'metadata'
            }
          })
        } else {
          updateVideo(result.id, {
            duration: result.duration,
            fps: result.fps
          })
        }
      })
    }

    void fetchAndUpdateMetadata()
  }, [videosArray, updateVideo])

  const handleRemoveSelectedFile = useCallback((id: string) => {
    setSelectedFiles((prev) => {
      const itemToRemove = prev.get(id)
      if (itemToRemove?.previewUrl) URL.revokeObjectURL(itemToRemove.previewUrl)
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
  }, [])

  const handleRemoveVideo = useCallback((id: string) => {
    setVideos((prev) => {
      const itemToRemove = prev.get(id)
      if (itemToRemove) {
        if (itemToRemove.originalUrl) URL.revokeObjectURL(itemToRemove.originalUrl)
        if (itemToRemove.processedUrl) URL.revokeObjectURL(itemToRemove.processedUrl)

        const newMap = new Map(prev)
        newMap.delete(id)
        return newMap
      }
      return prev
    })
  }, [])

  const handleCancelProcessing = useCallback(
    async (id: string) => {
      if (currentProcessingId.current !== id) return

      cancellationRef.current = true
      currentProcessingId.current = null
      handleRemoveVideo(id)

      await resetFFmpeg()
    },
    [handleRemoveVideo, resetFFmpeg]
  )

  const togglePause = useCallback(
    <T extends { isPaused: boolean }>(
      id: string,
      setMap: React.Dispatch<React.SetStateAction<Map<string, T>>>
    ) => {
      setMap((prev) => {
        const newMap = new Map(prev)
        const item = newMap.get(id)
        if (item) newMap.set(id, { ...item, isPaused: !item.isPaused })
        return newMap
      })
    },
    []
  )

  const handleToggleSelectedFilePlayPause = useCallback(
    (id: string) => {
      togglePause(id, setSelectedFiles)
    },
    [togglePause]
  )

  const handleToggleVideoPlayPause = useCallback(
    (id: string) => {
      togglePause(id, setVideos)
    },
    [togglePause]
  )

  return (
    <div className="space-y-4">
      <JobCard
        isJobCardOpen={isJobCardOpen}
        setIsJobCardOpen={setIsJobCardOpen}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        selectedFiles={selectedFilesArray}
        onRemoveSelectedFile={handleRemoveSelectedFile}
        onToggleSelectedFilePlayPause={handleToggleSelectedFilePlayPause}
        interpolationFactor={interpolationFactor}
        setInterpolationFactor={setInterpolationFactor}
        onAddToQueue={handleAddToQueue}
        isFFmpegLoaded={isFFmpegLoaded}
        isArrowGlowing={isArrowGlowing}
      />
      <QueueCard
        videos={videosArray}
        onRemove={handleRemoveVideo}
        onCancel={handleCancelProcessing}
        onTogglePlayPause={handleToggleVideoPlayPause}
      />
    </div>
  )
}
