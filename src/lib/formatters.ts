import type { ProcessingError, VideoStatus } from '@/types/video'
import type { Translator } from '@/lib/i18n/provider'

const BYTE_UNIT_BASE = 1024
const BYTE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB']

export const formatBytes = (bytes: number, decimalPlaces = 2) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 Bytes'
  const unitIndex = Math.min(
    Math.max(Math.floor(Math.log(bytes) / Math.log(BYTE_UNIT_BASE)), 0),
    BYTE_UNITS.length - 1
  )
  return `${Number.parseFloat((bytes / BYTE_UNIT_BASE ** unitIndex).toFixed(Math.max(0, decimalPlaces)))} ${BYTE_UNITS[unitIndex]}`
}

export const getStatusText = (translate: Translator, status: VideoStatus) => translate(`status.${status}`)

export const getErrorText = (translate: Translator, processingError?: ProcessingError) => {
  if (!processingError) return ''
  switch (processingError.type) {
    case 'metadata':
      return translate('errors.metadataReadError')
    case 'shared':
      return translate('errors.sharedArrayBufferError')
    case 'unknown':
    default:
      return processingError.message
        ? translate('errors.unknownProcessingError', {
            message: processingError.message
          })
        : translate('errors.unknownProcessingErrorNoDetails')
  }
}
