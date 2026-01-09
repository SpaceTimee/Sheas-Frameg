import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import type { VideoFile, ProcessingError } from '@/types/video'
import { insertFilenameSuffix } from '@/lib/utils'
import MediaInfoFactory from 'mediainfo.js'

export interface VideoInfo {
  id: string
  duration: number
  fps: number
}

interface MediaInfoTrack {
  '@type': string
  Duration?: string | number
  FrameRate?: string | number
}

interface MediaInfoResult {
  media?: {
    track: MediaInfoTrack[]
  }
}

const parseMediaNumber = (value: string | number | undefined, fallback: number) => {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  const normalized = value.trim().split(' ')[0]
  if (!normalized) return fallback

  if (normalized.includes('/')) {
    const [numerator, denominator] = normalized.split('/').map((value) => Number.parseFloat(value))
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0)
      return numerator / denominator
  }

  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const getVideoInfo = async (id: string, file: File | Blob): Promise<VideoInfo> => {
  const mediainfo = await MediaInfoFactory({
    format: 'object',
    locateFile: () => '/MediaInfoModule.wasm'
  })

  if (!mediainfo) throw new Error('Failed to initialize MediaInfo')

  try {
    const result = (await mediainfo.analyzeData(
      () => file.size,
      async (chunkSize, offset) => {
        return new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer())
      }
    )) as MediaInfoResult

    const track = result?.media?.track?.find((t) => t['@type'] === 'Video')

    if (!track) throw new Error('No video track found')

    return {
      id,
      duration: parseMediaNumber(track.Duration, 0),
      fps: parseMediaNumber(track.FrameRate, 30)
    }
  } finally {
    mediainfo.close()
  }
}

export async function processVideo(
  ffmpeg: FFmpeg,
  video: VideoFile,
  updateVideo: (id: string, updates: Partial<VideoFile>) => void,
  cancellationRef: { current: boolean },
  onProgress: (progress: { time: number }) => void
): Promise<void> {
  const { duration, fps, file } = video
  if (!duration || !fps) {
    const error: ProcessingError = {
      type: 'metadata'
    }
    updateVideo(video.id, { status: 'error', error })
    return
  }

  const inputFileName = file.name
  const outputFileName = insertFilenameSuffix(inputFileName, `-interpolated-${video.id}`)

  try {
    updateVideo(video.id, { status: 'processing', progress: 0 })

    ffmpeg.on('progress', onProgress)

    await ffmpeg.writeFile(inputFileName, await fetchFile(file))

    const command = [
      '-i',
      inputFileName,
      '-vf',
      `minterpolate=fps=${fps * video.factor}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1`,
      outputFileName
    ]

    const result = await ffmpeg.exec(command)

    if (cancellationRef.current) return

    if (result === 0) {
      const data = await ffmpeg.readFile(outputFileName)
      const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' })

      const processedUrl = URL.createObjectURL(blob)
      const { duration: processedDuration, fps: processedFps } = await getVideoInfo(
        `processed-${video.id}`,
        blob
      )

      updateVideo(video.id, {
        status: 'completed',
        progress: 100,
        processedUrl,
        duration: processedDuration,
        fps: processedFps
      })
    } else {
      throw new Error(`FFmpeg exited with a non-zero status: ${result}`)
    }
  } catch (err: unknown) {
    if (cancellationRef.current) return

    const error = err as Error
    let processingError: ProcessingError

    if (error?.message?.includes('SharedArrayBuffer')) processingError = { type: 'shared' }
    else {
      processingError = {
        type: 'unknown',
        message: error.message
      }
    }

    updateVideo(video.id, { status: 'error', error: processingError })
  } finally {
    ffmpeg.off('progress', onProgress)
    try {
      await Promise.allSettled([ffmpeg.deleteFile(inputFileName), ffmpeg.deleteFile(outputFileName)])
    } catch {
      // Ignore cleanup errors
    }
  }
}
