'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from './ui/separator'
import { useLanguage } from '@/lib/i18n/provider'
import { formatBytes } from '@/lib/formatters'
import VideoPreview from './video-preview'
import { Loader2, Trash2, AlertCircle } from 'lucide-react'
import type { SelectedFile } from '@/types/video'

function SelectedFileItemComponent({
  item,
  onRemove,
  onTogglePlayPause
}: {
  item: SelectedFile
  onRemove: (id: string) => void
  onTogglePlayPause: (id: string) => void
}) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <VideoPreview
        url={item.previewUrl}
        isPaused={item.isPaused}
        onTogglePlayPause={() => onTogglePlayPause(item.id)}
      />
      <div className="flex-1 w-full min-w-0">
        <p className="font-medium truncate pr-4">{item.file.name}</p>
        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatBytes(item.file.size)}</span>
            {item.error ? (
              <>
                <Separator orientation="vertical" className="h-3" />
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">{t('jobCard.invalidFile')}</span>
                </div>
              </>
            ) : (
              <>
                <Separator orientation="vertical" className="h-3" />
                {item.duration ? (
                  <span>{item.duration.toFixed(2)}s</span>
                ) : (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                <Separator orientation="vertical" className="h-3" />
                {item.fps ? (
                  <span>{item.fps.toFixed(2)} FPS</span>
                ) : (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => onRemove(item.id)}>
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            <span className="sr-only">{t('jobCard.removeFile', { fileName: item.file.name })}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

const SelectedFileItem = memo(SelectedFileItemComponent)
export default SelectedFileItem
