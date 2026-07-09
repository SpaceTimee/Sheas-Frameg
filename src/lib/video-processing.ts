import type { FFmpeg, ProgressEventCallback } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import MediaInfoFactory, { isTrackType, type MediaInfo } from 'mediainfo.js'
import { insertFilenameSuffix } from '@/lib/utils'
import type { VideoJob } from '@/types/video'

export interface VideoMetadata {
  duration: number
  fps: number
}

interface ProcessingCancellationRef {
  current: boolean
}

const getFiniteMediaNumber = (mediaNumber: number | undefined, fallbackValue: number) =>
  typeof mediaNumber === 'number' && Number.isFinite(mediaNumber) ? mediaNumber : fallbackValue

let mediaInfoPromise: Promise<MediaInfo<'object'>> | null = null

const getMediaInfo = (): Promise<MediaInfo<'object'>> => {
  mediaInfoPromise ??= MediaInfoFactory({
    format: 'object',
    locateFile: () => '/MediaInfoModule.wasm'
  })
  return mediaInfoPromise
}

export async function getVideoMetadata(videoFile: File | Blob): Promise<VideoMetadata> {
  const mediaInfoReader = await getMediaInfo()

  const metadataResult = await mediaInfoReader.analyzeData(
    () => videoFile.size,
    async (chunkSize, offset) =>
      new Uint8Array(await videoFile.slice(offset, offset + chunkSize).arrayBuffer())
  )

  const videoTrack = metadataResult.media?.track.find((mediaTrack) => isTrackType(mediaTrack, 'Video'))

  if (!videoTrack) throw new Error('No video track found')

  const duration = getFiniteMediaNumber(videoTrack.Duration, 0)
  const fps = getFiniteMediaNumber(videoTrack.FrameRate, 30)

  if (duration <= 0 || fps <= 0) throw new Error('Invalid video metadata')

  return {
    duration,
    fps
  }
}

export async function processVideo(
  ffmpeg: FFmpeg,
  videoJob: VideoJob,
  updateVideoJob: (videoJobId: string, videoJobUpdates: Partial<VideoJob>) => void,
  processingCancellationRef: ProcessingCancellationRef,
  handleProcessingProgress: ProgressEventCallback
): Promise<void> {
  const { duration, fps, file: videoFile } = videoJob

  if (duration === undefined || fps === undefined || duration <= 0 || fps <= 0) {
    updateVideoJob(videoJob.id, { status: 'error', error: { type: 'metadata' } })
    return
  }

  const inputFileName = videoFile.name
  const outputFileName = insertFilenameSuffix(inputFileName, `-interpolated-${videoJob.id}`)

  try {
    updateVideoJob(videoJob.id, { status: 'processing', progress: 0 })

    ffmpeg.on('progress', handleProcessingProgress)

    await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile))

    const ffmpegCommand = [
      '-i',
      inputFileName,
      '-vf',
      `minterpolate=fps=${fps * videoJob.interpolationFactor}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1`,
      outputFileName
    ]

    const exitCode = await ffmpeg.exec(ffmpegCommand)

    if (processingCancellationRef.current) return

    if (exitCode !== 0) {
      throw new Error(`FFmpeg exited with a non-zero status: ${exitCode}`)
    }

    const processedFileContent = await ffmpeg.readFile(outputFileName)
    if (processingCancellationRef.current) return

    const processedBlob = new Blob(
      [
        typeof processedFileContent === 'string' ? processedFileContent : new Uint8Array(processedFileContent)
      ],
      { type: 'video/mp4' }
    )

    const { duration: processedDuration, fps: processedFps } = await getVideoMetadata(processedBlob)
    if (processingCancellationRef.current) return

    const processedUrl = URL.createObjectURL(processedBlob)

    updateVideoJob(videoJob.id, {
      status: 'completed',
      progress: 100,
      processedUrl,
      duration: processedDuration,
      fps: processedFps
    })
  } catch (caughtError: unknown) {
    if (processingCancellationRef.current) return

    const caughtErrorMessage = caughtError instanceof Error ? caughtError.message : String(caughtError)
    updateVideoJob(videoJob.id, {
      status: 'error',
      error: caughtErrorMessage.includes('SharedArrayBuffer')
        ? { type: 'shared' }
        : { type: 'unknown', message: caughtErrorMessage }
    })
  } finally {
    ffmpeg.off('progress', handleProcessingProgress)
    await Promise.allSettled([ffmpeg.deleteFile(inputFileName), ffmpeg.deleteFile(outputFileName)])
  }
}
