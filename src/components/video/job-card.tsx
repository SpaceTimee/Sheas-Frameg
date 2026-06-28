'use client'

import { useState, type RefObject } from 'react'
import { FileVideo, ChevronUp, Loader2, ArrowDownCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useLanguage } from '@/lib/i18n/provider'
import { mergeClassNames } from '@/lib/utils'
import type { SelectedVideoFile } from '@/types/video'
import SelectedVideoFileItem from './file-item'
import FileUploader from './file-uploader'
import ProcessingWarning from './processing-warning'

interface JobCardProps {
  isJobCardOpen: boolean
  isFFmpegLoaded: boolean
  isQueueArrowGlowing: boolean
  videoFileInputRef: RefObject<HTMLInputElement | null>
  selectedVideoFiles: SelectedVideoFile[]
  interpolationFactor: number
  setIsJobCardOpen: (isOpen: boolean) => void
  setInterpolationFactor: (interpolationFactor: number) => void
  onVideoFilesChange: (fileList: FileList | null) => void
  onRemoveSelectedVideoFile: (selectedVideoFileId: string) => void
  onToggleSelectedVideoFilePlayPause: (selectedVideoFileId: string) => void
  onAddToQueue: () => void
}

export default function JobCard({
  isJobCardOpen,
  isFFmpegLoaded,
  isQueueArrowGlowing,
  videoFileInputRef,
  selectedVideoFiles,
  interpolationFactor,
  setIsJobCardOpen,
  setInterpolationFactor,
  onVideoFilesChange,
  onRemoveSelectedVideoFile,
  onToggleSelectedVideoFilePlayPause,
  onAddToQueue
}: JobCardProps) {
  const { translate } = useLanguage()
  const [isProcessingWarningVisible, setIsProcessingWarningVisible] = useState(true)
  const validSelectedVideoFileCount = selectedVideoFiles.filter(
    (selectedVideoFile) => !selectedVideoFile.error
  ).length
  const hasValidSelectedVideoFiles = validSelectedVideoFileCount > 0
  const isFFmpegLoading = hasValidSelectedVideoFiles && !isFFmpegLoaded
  const addToQueueButtonLabel = isFFmpegLoading
    ? translate('jobCard.button.loadingFfmpeg')
    : !hasValidSelectedVideoFiles
      ? translate('jobCard.button.addToQueue')
      : translate(
          validSelectedVideoFileCount > 1
            ? 'jobCard.button.addToQueue_plural'
            : 'jobCard.button.addToQueue_singular',
          {
            count: validSelectedVideoFileCount
          }
        )

  return (
    <>
      <Collapsible open={isJobCardOpen} onOpenChange={setIsJobCardOpen}>
        <Card>
          <div className="flex justify-between items-center pr-6">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <FileVideo aria-hidden="true" />
                {translate('jobCard.title')}
              </CardTitle>
            </CardHeader>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={translate('jobCard.toggleAriaLabel')}
              >
                <ChevronUp
                  className={mergeClassNames(
                    'transition-transform text-muted-foreground',
                    !isJobCardOpen && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <CardDescription className="px-6 pb-4">{translate('jobCard.description')}</CardDescription>

            <ProcessingWarning
              isVisible={isProcessingWarningVisible}
              onDismiss={() => setIsProcessingWarningVisible(false)}
            />

            <CardContent className="space-y-6 pt-2">
              <FileUploader videoFileInputRef={videoFileInputRef} onVideoFilesChange={onVideoFilesChange} />

              {selectedVideoFiles.length > 0 && (
                <ul className="divide-y divide-border">
                  {selectedVideoFiles.map((selectedVideoFile) => (
                    <li key={selectedVideoFile.id} className="py-4 first:pt-0 last:pb-0">
                      <SelectedVideoFileItem
                        selectedVideoFile={selectedVideoFile}
                        onRemove={onRemoveSelectedVideoFile}
                        onTogglePlayPause={onToggleSelectedVideoFilePlayPause}
                      />
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="grid gap-1">
                  <label htmlFor="interpolation-factor" className="text-sm font-medium">
                    {translate('jobCard.factor.label')}
                  </label>
                  <Select
                    value={String(interpolationFactor)}
                    onValueChange={(factorValue) => setInterpolationFactor(Number(factorValue))}
                  >
                    <SelectTrigger id="interpolation-factor">
                      <SelectValue placeholder={translate('jobCard.factor.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">{translate('jobCard.factor.2x')}</SelectItem>
                      <SelectItem value="3">{translate('jobCard.factor.3x')}</SelectItem>
                      <SelectItem value="4">{translate('jobCard.factor.4x')}</SelectItem>
                      <SelectItem value="5">{translate('jobCard.factor.5x')}</SelectItem>
                      <SelectItem value="6">{translate('jobCard.factor.6x')}</SelectItem>
                      <SelectItem value="8">{translate('jobCard.factor.8x')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Button
                    disabled={!hasValidSelectedVideoFiles || !isFFmpegLoaded}
                    className="w-full"
                    onClick={onAddToQueue}
                  >
                    {isFFmpegLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                    {addToQueueButtonLabel}
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      <div className="flex justify-center my-4">
        <div className={isJobCardOpen ? undefined : 'hidden'}>
          <ArrowDownCircle
            className={mergeClassNames(
              'h-8 w-8 text-muted-foreground/50',
              isQueueArrowGlowing && 'animate-neon-glow'
            )}
            aria-hidden="true"
          />
        </div>
      </div>
    </>
  )
}
