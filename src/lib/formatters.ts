import type { ProcessingError, VideoStatus } from '@/types/video'
import type { Translator } from '@/lib/i18n/provider'

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
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
