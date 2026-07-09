'use client'

import { useState, type RefObject } from 'react'
import { FileVideo, ChevronUp, Loader2, SquareArrowDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useAnimatedList } from '@/hooks/use-animated-list'
import { useLanguage } from '@/lib/i18n/provider'
import { mergeClassNames } from '@/lib/utils'
import type { SelectedVideoFile } from '@/types/video'
import { AnimatedHeight } from '@/components/video/animated-height'
import SelectedVideoFileItem from '@/components/video/file-item'
import FileUploader from '@/components/video/file-uploader'
import ProcessingWarning from '@/components/video/processing-warning'

const INTERPOLATION_FACTORS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const

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
  onRenameSelectedVideoFile: (selectedVideoFileId: string, customName: string) => void
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
  onRenameSelectedVideoFile,
  onAddToQueue
}: JobCardProps) {
  const { translate } = useLanguage()
  const [isProcessingWarningVisible, setIsProcessingWarningVisible] = useState(true)
  const {
    animatedItems: animatedSelectedVideoFiles,
    handleTransitionEnd: handleSelectedVideoFileTransitionEnd
  } = useAnimatedList(selectedVideoFiles)
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
          <div className="flex items-center justify-between pr-6">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2 text-xl">
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
                    'text-muted-foreground transition-transform',
                    !isJobCardOpen && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
            <CardContent className="space-y-6 px-6 pb-6">
              <CardDescription>{translate('jobCard.description')}</CardDescription>

              <div>
                <ProcessingWarning
                  isVisible={isProcessingWarningVisible}
                  onDismiss={() => setIsProcessingWarningVisible(false)}
                />
                <FileUploader videoFileInputRef={videoFileInputRef} onVideoFilesChange={onVideoFilesChange} />
              </div>

              {animatedSelectedVideoFiles.length > 0 && (
                <ul className="space-y-6">
                  {animatedSelectedVideoFiles.map(({ item, isOpen }) => (
                    <li key={item.id}>
                      <AnimatedHeight
                        isOpen={isOpen}
                        onTransitionEnd={() => handleSelectedVideoFileTransitionEnd(item.id)}
                      >
                        <SelectedVideoFileItem
                          selectedVideoFile={item}
                          onRemove={onRemoveSelectedVideoFile}
                          onTogglePlayPause={onToggleSelectedVideoFilePlayPause}
                          onRename={onRenameSelectedVideoFile}
                        />
                      </AnimatedHeight>
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
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
                      {INTERPOLATION_FACTORS.map((factor) => (
                        <SelectItem key={factor} value={String(factor)}>
                          {translate('jobCard.factor.option', { factor })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Button
                    disabled={!hasValidSelectedVideoFiles || !isFFmpegLoaded}
                    className="w-full"
                    onClick={onAddToQueue}
                  >
                    {isFFmpegLoading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                    {addToQueueButtonLabel}
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      <div className="my-4 flex justify-center">
        <div className={isJobCardOpen ? undefined : 'hidden'}>
          <SquareArrowDown
            className={mergeClassNames(
              'text-muted-foreground/50 size-8',
              isQueueArrowGlowing && 'animate-neon-glow'
            )}
            aria-hidden="true"
          />
        </div>
      </div>
    </>
  )
}
