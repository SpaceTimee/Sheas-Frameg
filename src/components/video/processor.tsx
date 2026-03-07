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
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [interpolationFactor, setInterpolationFactor] = useState<number>(2)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { ffmpegRef, isLoaded: isFFmpegLoaded, reset: resetFFmpeg } = useFFmpeg()
  const currentProcessingId = useRef<string | null>(null)
  const metadataFetchingRef = useRef<Set<string>>(new Set())
  const cancellationRef = useRef(false)
  const [isArrowGlowing, setIsArrowGlowing] = useState(false)
  const [isJobCardOpen, setIsJobCardOpen] = useState(true)

  const isProcessing = useMemo(() => videos.some((videoFile) => videoFile.status === 'processing'), [videos])

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

      setSelectedFiles((currentSelectedFiles) => [...currentSelectedFiles, ...newFiles])

      if (fileInputRef.current) fileInputRef.current.value = ''

      newFiles.forEach(async (file) => {
        try {
          const { duration, fps } = await getVideoInfo(file.id, file.file)
          setSelectedFiles((currentSelectedFiles) =>
            currentSelectedFiles.map((fileState) =>
              fileState.id === file.id ? { ...fileState, duration, fps } : fileState
            )
          )
        } catch {
          toast({
            variant: 'destructive',
            title: t('toast.errorReadingFile.title', { fileName: file.file.name }),
            description: t('toast.errorReadingFile.description')
          })
          setSelectedFiles((currentSelectedFiles) =>
            currentSelectedFiles.map((fileState) =>
              fileState.id === file.id ? { ...fileState, error: true } : fileState
            )
          )
        }
      })
    },
    [t]
  )

  const handleAddToQueue = useCallback(() => {
    const validFiles = selectedFiles.filter((file) => !file.error)

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

    setVideos((currentVideos) => [...currentVideos, ...newVideos])

    selectedFiles.forEach((file) => {
      if (file.error && file.previewUrl) URL.revokeObjectURL(file.previewUrl)
    })
    setSelectedFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [selectedFiles, interpolationFactor, t])

  const updateVideo = useCallback((id: string, updates: Partial<VideoFile>) => {
    setVideos((currentVideos) =>
      currentVideos.map((videoFile) => (videoFile.id === id ? { ...videoFile, ...updates } : videoFile))
    )
  }, [])

  useEffect(() => {
    if (!isFFmpegLoaded || isProcessing) return

    const timeoutId = setTimeout(() => {
      const nextVideo = videos.find((video) => video.status === 'queued' && video.duration && video.fps)
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
  }, [isFFmpegLoaded, isProcessing, videos, updateVideo, ffmpegRef])

  useEffect(() => {
    const videosToUpdate = videos.filter(
      (video) =>
        video.status === 'queued' &&
        (!video.duration || !video.fps) &&
        !metadataFetchingRef.current.has(video.id)
    )

    if (videosToUpdate.length === 0) return

    videosToUpdate.forEach(async (video) => {
      metadataFetchingRef.current.add(video.id)
      try {
        const { duration, fps } = await getVideoInfo(video.id, video.file)
        updateVideo(video.id, { duration, fps })
      } catch {
        updateVideo(video.id, {
          status: 'error',
          error: { type: 'metadata' }
        })
      } finally {
        metadataFetchingRef.current.delete(video.id)
      }
    })
  }, [videos, updateVideo])

  const handleRemoveSelectedFile = useCallback((id: string) => {
    setSelectedFiles((currentSelectedFiles) => {
      const fileToRemove = currentSelectedFiles.find((selectedFile) => selectedFile.id === id)
      if (fileToRemove?.previewUrl) URL.revokeObjectURL(fileToRemove.previewUrl)
      return currentSelectedFiles.filter((selectedFile) => selectedFile.id !== id)
    })
  }, [])

  const handleRemoveVideo = useCallback((id: string) => {
    setVideos((currentVideos) => {
      const videoToRemove = currentVideos.find((videoFile) => videoFile.id === id)
      if (videoToRemove) {
        if (videoToRemove.originalUrl) URL.revokeObjectURL(videoToRemove.originalUrl)
        if (videoToRemove.processedUrl) URL.revokeObjectURL(videoToRemove.processedUrl)
      }
      return currentVideos.filter((videoFile) => videoFile.id !== id)
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
    <T extends { id: string; isPaused: boolean }>(
      id: string,
      setTargetStateArray: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      setTargetStateArray((currentStateArray) =>
        currentStateArray.map((stateItem) =>
          stateItem.id === id ? { ...stateItem, isPaused: !stateItem.isPaused } : stateItem
        )
      )
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
        selectedFiles={selectedFiles}
        onRemoveSelectedFile={handleRemoveSelectedFile}
        onToggleSelectedFilePlayPause={handleToggleSelectedFilePlayPause}
        interpolationFactor={interpolationFactor}
        setInterpolationFactor={setInterpolationFactor}
        onAddToQueue={handleAddToQueue}
        isFFmpegLoaded={isFFmpegLoaded}
        isArrowGlowing={isArrowGlowing}
      />
      <QueueCard
        videos={videos}
        onRemove={handleRemoveVideo}
        onCancel={handleCancelProcessing}
        onTogglePlayPause={handleToggleVideoPlayPause}
      />
    </div>
  )
}
