import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import type { VideoFile, ProcessingError } from '@/types/video'

export interface VideoInfo {
  id: string
  duration: number
  fps: number
}

export const getVideoInfo = (id: string, file: File | Blob): Promise<VideoInfo> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    const videoUrl = URL.createObjectURL(file)
    video.src = videoUrl

    const cleanup = () => {
      URL.revokeObjectURL(videoUrl)
      video.remove()
    }

    video.onloadedmetadata = () => {
      const duration = video.duration

      let frameCount = 0
      const frameTimestamps: number[] = []
      video.muted = true

      const onFrame: VideoFrameRequestCallback = (now, metadata) => {
        frameCount++
        if (
          frameTimestamps.length === 0 ||
          metadata.mediaTime > frameTimestamps[frameTimestamps.length - 1]
        ) {
          frameTimestamps.push(metadata.mediaTime)
        }

        if (metadata.mediaTime < 2 && frameCount < 60 && !video.ended) {
          video.requestVideoFrameCallback(onFrame)
        } else {
          video.pause()
          cleanup()

          if (frameTimestamps.length > 1) {
            const totalTime = frameTimestamps[frameTimestamps.length - 1] - frameTimestamps[0]
            const avgGap = totalTime / (frameTimestamps.length - 1)
            const fps = avgGap > 0 ? 1 / avgGap : 30
            resolve({ id, duration, fps })
          } else {
            resolve({ id, duration, fps: 30 })
          }
        }
      }

      video
        .play()
        .then(() => {
          video.requestVideoFrameCallback(onFrame)
        })
        .catch((err) => {
          cleanup()
          reject({ ...err, id })
        })
    }

    video.onerror = (e) => {
      cleanup()
      reject({ error: e, id })
    }
  })
}

export async function processVideo(
  ffmpeg: FFmpeg,
  video: VideoFile,
  updateVideo: (id: string, updates: Partial<VideoFile>) => void,
  cancellationRef: { current: boolean },
  onProgress: (progress: { time: number }) => void
) {
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
    const outputFileName = `interpolated-${video.id}-${file.name}`

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
      const blob = new Blob([data as any], { type: 'video/mp4' }) // eslint-disable-line @typescript-eslint/no-explicit-any

      const processedUrl = URL.createObjectURL(blob)
      const { duration: processedDuration, fps: processedFps } = await getVideoInfo(
        `processed-${video.id}`,
        blob
      )

      updateVideo(video.id, {
        status: 'completed',
        progress: 100,
        processedUrl: processedUrl,
        duration: processedDuration,
        fps: processedFps
      })

      await ffmpeg.deleteFile(inputFileName)
      await ffmpeg.deleteFile(outputFileName)
    } else {
      throw new Error(`FFmpeg exited with a non-zero status: ${result}`)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (cancellationRef.current) {
      return
    }

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
