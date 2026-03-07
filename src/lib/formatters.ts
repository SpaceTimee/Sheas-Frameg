import type { ProcessingError, VideoStatus } from '@/types/video'
import type { Translator } from '@/lib/i18n/provider'

const KILO_BYTES = 1024
const BYTE_SIZES = ['Bytes', 'KB', 'MB', 'GB', 'TB']

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const decimalPlaces = decimals < 0 ? 0 : decimals
  const sizeIndex = Math.floor(Math.log(bytes) / Math.log(KILO_BYTES))
  return (
    parseFloat((bytes / Math.pow(KILO_BYTES, sizeIndex)).toFixed(decimalPlaces)) + ' ' + BYTE_SIZES[sizeIndex]
  )
}

export const getStatusMessageText = (t: Translator, status: VideoStatus) => {
  return t(`status.${status}`)
}

export const getErrorMessageText = (t: Translator, error?: ProcessingError) => {
  if (!error) return ''
  switch (error.type) {
    case 'metadata':
      return t('errors.metadataReadError')
    case 'shared':
      return t('errors.sharedArrayBufferError')
    case 'unknown':
    default:
      if (!error.message) return t('errors.unknownProcessingErrorNoDetails')
      return t('errors.unknownProcessingError', {
        message: error.message
      })
  }
}
