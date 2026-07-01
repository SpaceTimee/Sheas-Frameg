'use client'

import { memo, type ReactNode } from 'react'
import { Clock, Loader2, CheckCircle2, XCircle, Download, Ban, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { downloadFile } from '@/lib/download'
import { useLanguage } from '@/lib/i18n/provider'
import { formatBytes, getStatusText, getErrorText } from '@/lib/formatters'
import { buildDownloadFileName, resolveDisplayName } from '@/lib/utils'
import type { VideoJob, VideoStatus } from '@/types/video'
import VideoPreview from './video-preview'
import NameField from './name-field'

const VIDEO_STATUS_ICONS = {
  queued: <Clock className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
  processing: <Loader2 className="h-5 w-5 animate-spin text-blue-500" aria-hidden="true" />,
  completed: <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />,
  error: <XCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
} satisfies Record<VideoStatus, ReactNode>

interface VideoJobItemProps {
  videoJob: VideoJob
  onRemove: (videoJobId: string) => void
  onCancel: (videoJobId: string) => void
  onTogglePlayPause: (videoJobId: string) => void
  onRename: (videoJobId: string, customName: string) => void
}

function VideoJobItem({ videoJob, onRemove, onCancel, onTogglePlayPause, onRename }: VideoJobItemProps) {
  const { translate } = useLanguage()

  const displayName = resolveDisplayName(videoJob.customName, videoJob.file)
  const videoJobErrorText = getErrorText(translate, videoJob.error)

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <VideoPreview
        videoUrl={videoJob.processedUrl ?? videoJob.originalUrl}
        isPaused={videoJob.isPaused}
        onTogglePlayPause={() => onTogglePlayPause(videoJob.id)}
      />
      <div className="flex-1 w-full min-w-0">
        <div className="flex justify-between items-center gap-2">
          <NameField
            displayName={displayName}
            fileName={videoJob.file.name}
            onRename={(customName) => onRename(videoJob.id, customName)}
          />
          <Badge variant="secondary" className="whitespace-nowrap shrink-0">
            {translate('queueCard.factorBadge', { factor: videoJob.interpolationFactor })}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span>{formatBytes(videoJob.file.size)}</span>
            <Separator orientation="vertical" className="h-3" />

            {videoJob.duration !== undefined ? (
              <span>{videoJob.duration.toFixed(2)}s</span>
            ) : (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            )}

            <Separator orientation="vertical" className="h-3" />

            {videoJob.fps !== undefined ? (
              <span>{videoJob.fps.toFixed(2)} FPS</span>
            ) : (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            )}

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Separator orientation="vertical" className="h-3 hidden md:block" />
              {VIDEO_STATUS_ICONS[videoJob.status]}
              <span className="text-sm capitalize">{getStatusText(translate, videoJob.status)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {videoJob.status === 'completed' && videoJob.processedUrl && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={translate('queueCard.downloadAriaLabel')}
                onClick={() => {
                  if (!videoJob.processedUrl) return
                  downloadFile(
                    videoJob.processedUrl,
                    buildDownloadFileName(displayName, videoJob.file.name, '-interpolated')
                  )
                }}
              >
                <Download className="h-4 w-4 text-muted-foreground hover:text-primary" aria-hidden="true" />
              </Button>
            )}

            {videoJob.status === 'processing' ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={translate('queueCard.cancelAriaLabel')}
                onClick={() => onCancel(videoJob.id)}
              >
                <Ban className="h-4 w-4 text-muted-foreground hover:text-destructive" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label={translate('queueCard.removeAriaLabel')}
                onClick={() => onRemove(videoJob.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        {videoJobErrorText && (
          <div className="flex items-center gap-2 text-xs text-destructive mt-1">
            <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span title={videoJobErrorText} className="truncate">
              {videoJobErrorText}
            </span>
          </div>
        )}

        <Progress
          value={videoJob.progress}
          className="w-full mt-2 h-2"
          aria-label={translate('queueCard.progressAriaLabel')}
          aria-valuetext={`${Math.round(videoJob.progress)}%`}
        />
      </div>
    </div>
  )
}

export default memo(VideoJobItem)
