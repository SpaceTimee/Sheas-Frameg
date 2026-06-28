'use client'

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { ProgressEventCallback } from '@ffmpeg/ffmpeg'
import { useFFmpeg } from '@/hooks/use-ffmpeg'
import { toast } from '@/hooks/use-toast'
import { useLanguage } from '@/lib/i18n/provider'
import { getVideoMetadata, processVideo } from '@/lib/video-processing'
import type { SelectedVideoFile, VideoJob } from '@/types/video'

export function useVideoProcessor() {
  const { translate } = useLanguage()
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([])
  const [selectedVideoFiles, setSelectedVideoFiles] = useState<SelectedVideoFile[]>([])
  const [interpolationFactor, setInterpolationFactor] = useState(2)
  const videoFileInputRef = useRef<HTMLInputElement | null>(null)

  const { ffmpegRef, isFFmpegLoaded, resetFFmpeg } = useFFmpeg()
  const currentProcessingVideoJobId = useRef<string | null>(null)
  const metadataFetchingIdsRef = useRef<Set<string>>(new Set())
  const processingCancellationRef = useRef(false)
  const [isQueueArrowGlowing, setIsQueueArrowGlowing] = useState(false)
  const [isJobCardOpen, setIsJobCardOpen] = useState(true)

  const hasProcessingVideoJob = videoJobs.some((videoJob) => videoJob.status === 'processing')

  useEffect(() => {
    if (!isQueueArrowGlowing) return

    const arrowGlowTimeoutId = setTimeout(() => setIsQueueArrowGlowing(false), 1000)
    return () => clearTimeout(arrowGlowTimeoutId)
  }, [isQueueArrowGlowing])

  const handleVideoFilesChange = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return

      const acceptedVideoFiles = [...fileList].filter((videoFile) => {
        if (videoFile.type.startsWith('video/')) return true
        toast({
          variant: 'destructive',
          title: translate('toast.invalidFileType.title'),
          description: translate('toast.invalidFileType.description', {
            fileName: videoFile.name
          })
        })
        return false
      })

      if (acceptedVideoFiles.length === 0) {
        if (videoFileInputRef.current) videoFileInputRef.current.value = ''
        return
      }

      const newSelectedVideoFiles: SelectedVideoFile[] = acceptedVideoFiles.map((videoFile) => ({
        id: crypto.randomUUID(),
        file: videoFile,
        originalUrl: URL.createObjectURL(videoFile),
        isPaused: false
      }))

      setSelectedVideoFiles((currentSelectedVideoFiles) => [
        ...currentSelectedVideoFiles,
        ...newSelectedVideoFiles
      ])

      if (videoFileInputRef.current) videoFileInputRef.current.value = ''

      void Promise.all(
        newSelectedVideoFiles.map(async (selectedVideoFile) => {
          try {
            const { duration, fps } = await getVideoMetadata(selectedVideoFile.file)
            setSelectedVideoFiles((currentSelectedVideoFiles) =>
              currentSelectedVideoFiles.map((selectedVideoFileState) =>
                selectedVideoFileState.id === selectedVideoFile.id
                  ? { ...selectedVideoFileState, duration, fps }
                  : selectedVideoFileState
              )
            )
          } catch {
            toast({
              variant: 'destructive',
              title: translate('toast.errorReadingFile.title', { fileName: selectedVideoFile.file.name }),
              description: translate('toast.errorReadingFile.description')
            })
            setSelectedVideoFiles((currentSelectedVideoFiles) =>
              currentSelectedVideoFiles.map((selectedVideoFileState) =>
                selectedVideoFileState.id === selectedVideoFile.id
                  ? { ...selectedVideoFileState, error: true }
                  : selectedVideoFileState
              )
            )
          }
        })
      )
    },
    [translate]
  )

  const handleAddToQueue = useCallback(() => {
    const validSelectedVideoFiles = selectedVideoFiles.filter((selectedVideoFile) => !selectedVideoFile.error)

    if (validSelectedVideoFiles.length === 0) {
      toast({
        variant: 'destructive',
        title: translate('toast.noFilesSelected.title'),
        description: translate('toast.noFilesSelected.description')
      })
      return
    }

    processingCancellationRef.current = false
    setIsQueueArrowGlowing(true)

    setVideoJobs((currentVideoJobs) => [
      ...currentVideoJobs,
      ...validSelectedVideoFiles.map((selectedVideoFile): VideoJob => ({
        id: crypto.randomUUID(),
        file: selectedVideoFile.file,
        interpolationFactor,
        status: 'queued',
        progress: 0,
        originalUrl: selectedVideoFile.originalUrl,
        isPaused: false,
        duration: selectedVideoFile.duration,
        fps: selectedVideoFile.fps
      }))
    ])

    for (const selectedVideoFile of selectedVideoFiles) {
      if (selectedVideoFile.error) URL.revokeObjectURL(selectedVideoFile.originalUrl)
    }
    setSelectedVideoFiles([])
    if (videoFileInputRef.current) videoFileInputRef.current.value = ''
  }, [selectedVideoFiles, interpolationFactor, translate])

  const updateVideoJob = useCallback((videoJobId: string, videoJobUpdates: Partial<VideoJob>) => {
    setVideoJobs((currentVideoJobs) =>
      currentVideoJobs.map((videoJob) =>
        videoJob.id === videoJobId ? { ...videoJob, ...videoJobUpdates } : videoJob
      )
    )
  }, [])

  useEffect(() => {
    if (!isFFmpegLoaded || hasProcessingVideoJob) return

    const processingStartTimeoutId = setTimeout(() => {
      const nextVideoJob = videoJobs.find(
        (videoJob) =>
          videoJob.status === 'queued' && videoJob.duration !== undefined && videoJob.fps !== undefined
      )

      const nextVideoDuration = nextVideoJob?.duration
      if (!nextVideoJob || !ffmpegRef.current || nextVideoDuration === undefined) return

      currentProcessingVideoJobId.current = nextVideoJob.id
      processingCancellationRef.current = false

      const handleProcessingProgress: ProgressEventCallback = ({ time: processedMicroseconds }) => {
        if (currentProcessingVideoJobId.current !== nextVideoJob.id) return

        updateVideoJob(nextVideoJob.id, {
          progress: Math.min((processedMicroseconds / 1_000_000 / nextVideoDuration) * 100, 100)
        })
      }

      processVideo(
        ffmpegRef.current,
        nextVideoJob,
        updateVideoJob,
        processingCancellationRef,
        handleProcessingProgress
      ).finally(() => {
        if (currentProcessingVideoJobId.current === nextVideoJob.id)
          currentProcessingVideoJobId.current = null
      })
    }, 0)

    return () => clearTimeout(processingStartTimeoutId)
  }, [isFFmpegLoaded, hasProcessingVideoJob, videoJobs, updateVideoJob, ffmpegRef])

  useEffect(() => {
    const videoJobsMissingMetadata = videoJobs.filter(
      (videoJob) =>
        videoJob.status === 'queued' &&
        (videoJob.duration === undefined || videoJob.fps === undefined) &&
        !metadataFetchingIdsRef.current.has(videoJob.id)
    )

    if (videoJobsMissingMetadata.length === 0) return

    void Promise.all(
      videoJobsMissingMetadata.map(async (videoJob) => {
        metadataFetchingIdsRef.current.add(videoJob.id)
        try {
          const { duration, fps } = await getVideoMetadata(videoJob.file)
          updateVideoJob(videoJob.id, { duration, fps })
        } catch {
          updateVideoJob(videoJob.id, {
            status: 'error',
            error: { type: 'metadata' }
          })
        } finally {
          metadataFetchingIdsRef.current.delete(videoJob.id)
        }
      })
    )
  }, [videoJobs, updateVideoJob])

  const handleRemoveSelectedVideoFile = useCallback((selectedVideoFileId: string) => {
    setSelectedVideoFiles((currentSelectedVideoFiles) => {
      const selectedVideoFileToRemove = currentSelectedVideoFiles.find(
        (selectedVideoFile) => selectedVideoFile.id === selectedVideoFileId
      )
      if (selectedVideoFileToRemove) URL.revokeObjectURL(selectedVideoFileToRemove.originalUrl)
      return currentSelectedVideoFiles.filter(
        (selectedVideoFile) => selectedVideoFile.id !== selectedVideoFileId
      )
    })
  }, [])

  const handleRemoveVideoJob = useCallback((videoJobId: string) => {
    setVideoJobs((currentVideoJobs) => {
      const videoJobToRemove = currentVideoJobs.find((videoJob) => videoJob.id === videoJobId)
      if (videoJobToRemove) {
        URL.revokeObjectURL(videoJobToRemove.originalUrl)
        if (videoJobToRemove.processedUrl) URL.revokeObjectURL(videoJobToRemove.processedUrl)
      }
      return currentVideoJobs.filter((videoJob) => videoJob.id !== videoJobId)
    })
  }, [])

  const handleCancelProcessing = useCallback(
    async (videoJobId: string) => {
      if (currentProcessingVideoJobId.current !== videoJobId) return

      processingCancellationRef.current = true
      currentProcessingVideoJobId.current = null
      handleRemoveVideoJob(videoJobId)

      await resetFFmpeg()
    },
    [handleRemoveVideoJob, resetFFmpeg]
  )

  const togglePausedState = useCallback(
    <PausableEntry extends { id: string; isPaused: boolean }>(
      pausableEntryId: string,
      setPausableEntries: Dispatch<SetStateAction<PausableEntry[]>>
    ) => {
      setPausableEntries((currentPausableEntries) =>
        currentPausableEntries.map((pausableEntry) =>
          pausableEntry.id === pausableEntryId
            ? { ...pausableEntry, isPaused: !pausableEntry.isPaused }
            : pausableEntry
        )
      )
    },
    []
  )

  const handleToggleSelectedVideoFilePlayPause = useCallback(
    (selectedVideoFileId: string) => {
      togglePausedState(selectedVideoFileId, setSelectedVideoFiles)
    },
    [togglePausedState]
  )

  const handleToggleVideoJobPlayPause = useCallback(
    (videoJobId: string) => {
      togglePausedState(videoJobId, setVideoJobs)
    },
    [togglePausedState]
  )

  return {
    videoJobs,
    selectedVideoFiles,
    interpolationFactor,
    setInterpolationFactor,
    videoFileInputRef,
    isFFmpegLoaded,
    isQueueArrowGlowing,
    isJobCardOpen,
    setIsJobCardOpen,
    handleVideoFilesChange,
    handleAddToQueue,
    handleRemoveSelectedVideoFile,
    handleRemoveVideoJob,
    handleCancelProcessing,
    handleToggleSelectedVideoFilePlayPause,
    handleToggleVideoJobPlayPause
  }
}
