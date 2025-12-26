export type VideoStatus = 'queued' | 'processing' | 'completed' | 'error'
export type ProcessingErrorType = 'shared-array-buffer' | 'unknown'

export interface ProcessingError {
  type: ProcessingErrorType
  message?: string
}

export interface VideoFile {
  id: string
  file: File
  factor: number
  status: VideoStatus
  progress: number
  processedUrl?: string
  originalUrl: string
  error?: ProcessingError
  isPaused: boolean
  duration?: number
  fps?: number
}

export interface SelectedFile {
  id: string
  file: File
  previewUrl: string
  duration?: number
  fps?: number
  isPaused: boolean
  error?: boolean
}
