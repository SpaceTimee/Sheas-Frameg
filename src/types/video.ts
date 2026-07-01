export type VideoStatus = 'queued' | 'processing' | 'completed' | 'error'
export type ProcessingErrorType = 'metadata' | 'shared' | 'unknown'

export interface ProcessingError {
  type: ProcessingErrorType
  message?: string
}

export interface VideoJob {
  id: string
  file: File
  customName?: string
  interpolationFactor: number
  status: VideoStatus
  progress: number
  originalUrl: string
  processedUrl?: string
  isPaused: boolean
  duration?: number
  fps?: number
  error?: ProcessingError
}

export interface SelectedVideoFile {
  id: string
  file: File
  customName?: string
  originalUrl: string
  isPaused: boolean
  duration?: number
  fps?: number
  error?: boolean
}
