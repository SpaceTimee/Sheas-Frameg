export type VideoStatus = 'queued' | 'processing' | 'completed' | 'error'
export type ProcessingErrorType = 'metadata' | 'shared' | 'unknown'

export interface ProcessingError {
  readonly type: ProcessingErrorType
  readonly message?: string
}

export interface VideoJob {
  readonly id: string
  readonly file: File
  readonly customName?: string
  readonly interpolationFactor: number
  readonly status: VideoStatus
  readonly progress: number
  readonly originalUrl: string
  readonly processedUrl?: string
  readonly isPaused: boolean
  readonly duration?: number
  readonly fps?: number
  readonly error?: ProcessingError
}

export interface SelectedVideoFile {
  readonly id: string
  readonly file: File
  readonly customName?: string
  readonly originalUrl: string
  readonly isPaused: boolean
  readonly duration?: number
  readonly fps?: number
  readonly error?: boolean
}
