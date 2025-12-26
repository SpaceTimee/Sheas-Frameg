'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, Loader2, CheckCircle2, Download, XCircle, Trash2, Info, Ban } from 'lucide-react'
import { Separator } from './ui/separator'
import { useLanguage } from '@/lib/i18n/provider'
import { formatBytes, getStatusMessageText, getErrorMessageText } from '@/lib/formatters'
import VideoPreview from './video-preview'
import { useDownloadFile } from '@/hooks/use-download-file'
import type { VideoFile, VideoStatus } from '@/types/video'
import { cn, insertFilenameSuffix } from '@/lib/utils'

const statusIcons: Record<VideoStatus, React.ReactNode> = {
  queued: <Clock className="h-5 w-5 text-yellow-500" />,
  processing: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
  completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />
}

const ProcessingVideoItem = memo(function ProcessingVideoItem({
  video,
  onRemove,
  onCancel,
  onTogglePlayPause
}: {
  video: VideoFile
  onRemove: (id: string) => void
  onCancel: (id: string) => void
  onTogglePlayPause: (id: string) => void
}) {
  const { t } = useLanguage()
  const downloadFile = useDownloadFile()

  const previewUrl =
    video.status === 'completed' && video.processedUrl ? video.processedUrl : video.originalUrl

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 first:pt-0 last:pb-0">
      <VideoPreview
        url={previewUrl}
        isPaused={video.isPaused}
        onTogglePlayPause={() => onTogglePlayPause(video.id)}
      />
      <div className="flex-1 w-full min-w-0">
        <div className="flex justify-between items-start">
          <p className="font-medium truncate pr-4">{video.file.name}</p>
          <Badge variant="secondary" className="whitespace-nowrap">
            {t('queueCard.factorBadge', { factor: video.factor })}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span>{formatBytes(video.file.size)}</span>
            <Separator orientation="vertical" className="h-3" />
            {video.duration ? (
              <span>{video.duration.toFixed(2)}s</span>
            ) : (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            <Separator orientation="vertical" className="h-3" />
            {video.fps ? (
              <span>{video.fps.toFixed(2)} FPS</span>
            ) : (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            <div
              className={cn('flex items-center gap-2 md:w-auto w-full', video.status === 'error' && 'w-full')}
            >
              <Separator orientation="vertical" className="h-3 hidden md:block" />
              {statusIcons[video.status]}
              <span className="text-sm capitalize">{getStatusMessageText(t, video.status)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {video.status === 'completed' && video.processedUrl && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  downloadFile(video.processedUrl!, insertFilenameSuffix(video.file.name, '-interpolated'))
                }
                aria-label={t('queueCard.downloadAriaLabel')}
              >
                <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
            )}
            {video.status === 'processing' ? (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onCancel(video.id)}
                aria-label={t('queueCard.cancelAriaLabel')}
              >
                <Ban className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemove(video.id)}
                aria-label={t('queueCard.removeAriaLabel')}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            )}
          </div>
        </div>
        {video.status === 'error' && video.error && (
          <div className="flex items-center gap-2 text-xs text-destructive mt-1">
            <Info className="h-3 w-3 flex-shrink-0" />
            <span className="truncate" title={getErrorMessageText(t, video.error)}>
              {getErrorMessageText(t, video.error)}
            </span>
          </div>
        )}
        <Progress value={video.progress} className="w-full mt-2 h-2" />
      </div>
    </div>
  )
})

export default ProcessingVideoItem
