'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileVideo, ChevronUp, Loader2, ArrowDownCircle } from 'lucide-react'
import SelectedFileItem from './selected-file-item'
import { useLanguage } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'
import type { SelectedFile } from '@/types/video'

interface JobCardProps {
  isJobCardOpen: boolean
  setIsJobCardOpen: (isOpen: boolean) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileChange: (files: FileList | null) => void
  selectedFiles: SelectedFile[]
  onRemoveSelectedFile: (id: string) => void
  onToggleSelectedFilePlayPause: (id: string) => void
  interpolationFactor: number
  setInterpolationFactor: (factor: number) => void
  onAddToQueue: () => void
  isAddingToQueue: boolean
  isFfmpegLoaded: boolean
  isArrowGlowing: boolean
}

export default function JobCard({
  isJobCardOpen,
  setIsJobCardOpen,
  fileInputRef,
  onFileChange,
  selectedFiles,
  onRemoveSelectedFile,
  onToggleSelectedFilePlayPause,
  interpolationFactor,
  setInterpolationFactor,
  onAddToQueue,
  isAddingToQueue,
  isFfmpegLoaded,
  isArrowGlowing
}: JobCardProps) {
  const { t } = useLanguage()
  const hasValidFiles = selectedFiles.some((f) => !f.error)

  const getButtonText = () => {
    if (isAddingToQueue) {
      return t('jobCard.button.addingToQueue')
    }
    if (hasValidFiles && !isFfmpegLoaded) {
      return t('jobCard.button.loadingFfmpeg')
    }
    const validFileCount = selectedFiles.filter((f) => !f.error).length
    return t(validFileCount > 1 ? 'jobCard.button.addToQueue_plural' : 'jobCard.button.addToQueue_singular', {
      count: validFileCount
    })
  }

  return (
    <>
      <Collapsible open={isJobCardOpen} onOpenChange={setIsJobCardOpen}>
        <Card>
          <div className="flex justify-between items-center pr-6">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <FileVideo />
                {t('jobCard.title')}
              </CardTitle>
            </CardHeader>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ChevronUp
                  className={cn('transition-transform text-muted-foreground', !isJobCardOpen && 'rotate-180')}
                />
                <span className="sr-only">Toggle Job Card</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <CardDescription className="px-6 pb-6">{t('jobCard.description')}</CardDescription>
              <CardContent className="space-y-6 pt-0">
                <div
                  className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary/50 bg-background hover:bg-accent/10 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault()
                    onFileChange(e.dataTransfer.files)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <FileVideo className="w-12 h-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-center text-muted-foreground">
                    <Button
                      variant="link"
                      className="font-semibold text-primary p-0 h-auto inline-block pointer-events-none"
                    >
                      {t('jobCard.upload.click')}
                    </Button>{' '}
                    {t('jobCard.upload.drag')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('jobCard.upload.formats')}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={(e) => onFileChange(e.target.files)}
                    multiple
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="divide-y divide-border">
                      {selectedFiles.map((item) => (
                        <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                          <SelectedFileItem
                            item={item}
                            onRemove={onRemoveSelectedFile}
                            onTogglePlayPause={onToggleSelectedFilePlayPause}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <label htmlFor="interpolation-factor" className="text-sm font-medium">
                      {t('jobCard.factor.label')}
                    </label>
                    <Select
                      value={String(interpolationFactor)}
                      onValueChange={(v) => setInterpolationFactor(Number(v))}
                    >
                      <SelectTrigger id="interpolation-factor">
                        <SelectValue placeholder={t('jobCard.factor.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">{t('jobCard.factor.2x')}</SelectItem>
                        <SelectItem value="3">{t('jobCard.factor.3x')}</SelectItem>
                        <SelectItem value="4">{t('jobCard.factor.4x')}</SelectItem>
                        <SelectItem value="5">{t('jobCard.factor.5x')}</SelectItem>
                        <SelectItem value="6">{t('jobCard.factor.6x')}</SelectItem>
                        <SelectItem value="8">{t('jobCard.factor.8x')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      onClick={onAddToQueue}
                      className="w-full"
                      disabled={!hasValidFiles || isAddingToQueue || !isFfmpegLoaded}
                    >
                      {(isAddingToQueue || (hasValidFiles && !isFfmpegLoaded)) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {getButtonText()}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      <div className="flex justify-center my-4">
        <div className={cn(!isJobCardOpen && 'hidden')}>
          <ArrowDownCircle
            className={cn('h-8 w-8 text-muted-foreground/50', isArrowGlowing && 'animate-neon-glow')}
          />
        </div>
      </div>
    </>
  )
}
