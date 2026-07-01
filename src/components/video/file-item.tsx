'use client'

import { memo } from 'react'
import { AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/lib/i18n/provider'
import { formatBytes } from '@/lib/formatters'
import { resolveDisplayName } from '@/lib/utils'
import type { SelectedVideoFile } from '@/types/video'
import VideoPreview from './video-preview'
import NameField from './name-field'

interface SelectedVideoFileItemProps {
  selectedVideoFile: SelectedVideoFile
  onRemove: (selectedVideoFileId: string) => void
  onTogglePlayPause: (selectedVideoFileId: string) => void
  onRename: (selectedVideoFileId: string, customName: string) => void
}

function SelectedVideoFileItem({
  selectedVideoFile,
  onRemove,
  onTogglePlayPause,
  onRename
}: SelectedVideoFileItemProps) {
  const { translate } = useLanguage()
  const displayName = resolveDisplayName(selectedVideoFile.customName, selectedVideoFile.file)

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <VideoPreview
        videoUrl={selectedVideoFile.originalUrl}
        isPaused={selectedVideoFile.isPaused}
        onTogglePlayPause={() => onTogglePlayPause(selectedVideoFile.id)}
      />
      <div className="flex-1 w-full min-w-0">
        <div className="flex justify-between items-center gap-2">
          <NameField
            displayName={displayName}
            fileName={selectedVideoFile.file.name}
            onRename={(customName) => onRename(selectedVideoFile.id, customName)}
          />
          <Badge variant="secondary" className="whitespace-nowrap shrink-0">
            {translate('queueCard.factorBadge', { factor: 1 })}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span>{formatBytes(selectedVideoFile.file.size)}</span>
            {selectedVideoFile.error ? (
              <>
                <Separator orientation="vertical" className="h-3" />
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <span className="font-medium">{translate('jobCard.invalidFile')}</span>
                </div>
              </>
            ) : (
              <>
                <Separator orientation="vertical" className="h-3" />
                {selectedVideoFile.duration !== undefined ? (
                  <span>{selectedVideoFile.duration.toFixed(2)}s</span>
                ) : (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                )}
                <Separator orientation="vertical" className="h-3" />
                {selectedVideoFile.fps !== undefined ? (
                  <span>{selectedVideoFile.fps.toFixed(2)} FPS</span>
                ) : (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                )}
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={translate('jobCard.removeFile', { fileName: displayName })}
            onClick={() => onRemove(selectedVideoFile.id)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default memo(SelectedVideoFileItem)
