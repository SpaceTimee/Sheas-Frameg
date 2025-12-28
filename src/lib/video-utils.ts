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
  Duration?: string
  FrameRate?: string
}

interface MediaInfoResult {
  media?: {
    track: MediaInfoTrack[]
  }
}

export const getVideoInfo = async (id: string, file: File | Blob): Promise<VideoInfo> => {
  const mediainfo = await MediaInfoFactory({
    format: 'object',
    locateFile: () => '/MediaInfoModule.wasm'
  })

  if (!mediainfo) {
    throw new Error('Failed to initialize MediaInfo')
  }

  try {
    const result = (await mediainfo.analyzeData(
      () => file.size,
      async (chunkSize, offset) => {
        const slice = file.slice(offset, offset + chunkSize)
        return new Uint8Array(await slice.arrayBuffer())
      }
    )) as MediaInfoResult

    const track = result?.media?.track?.find((t) => t['@type'] === 'Video')

    if (!track) throw new Error('No video track found')

    return {
      id,
      duration: parseFloat(track.Duration || '0'),
      fps: parseFloat(track.FrameRate || '30')
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
      type: 'unknown',
      message: 'Video metadata not available'
    }
    updateVideo(video.id, { status: 'error', error })
    return
  }

  try {
    updateVideo(video.id, { status: 'processing', progress: 0 })

    ffmpeg.on('progress', onProgress)

    const inputFileName = file.name
    const outputFileName = insertFilenameSuffix(inputFileName, `-interpolated-${video.id}`)

    await ffmpeg.writeFile(inputFileName, await fetchFile(file))

    const targetFps = fps * video.factor

    const command = [
      '-i',
      inputFileName,
      '-vf',
      `minterpolate=fps=${targetFps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1`,
      outputFileName
    ]

    const result = await ffmpeg.exec(command)

    if (cancellationRef.current) {
      return
    }

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

      await ffmpeg.deleteFile(inputFileName)
      await ffmpeg.deleteFile(outputFileName)
    } else {
      throw new Error(`FFmpeg exited with a non-zero status: ${result}`)
    }
  } catch (err: unknown) {
    if (cancellationRef.current) {
      return
    }

    const error = err as Error
    let processingError: ProcessingError

    if (error?.message?.includes('SharedArrayBuffer')) {
      processingError = { type: 'shared-array-buffer' }
    } else {
      processingError = {
        type: 'unknown',
        message: error.message || 'Unknown error'
      }
    }

    updateVideo(video.id, { status: 'error', error: processingError })
  } finally {
    ffmpeg.off('progress', onProgress)
  }
}
