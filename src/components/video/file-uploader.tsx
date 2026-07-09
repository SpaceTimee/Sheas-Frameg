'use client'

import type { RefObject } from 'react'
import { FileVideo } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/provider'

interface FileUploaderProps {
  videoFileInputRef: RefObject<HTMLInputElement | null>
  onVideoFilesChange: (fileList: FileList | null) => void
}

export default function FileUploader({ videoFileInputRef, onVideoFilesChange }: FileUploaderProps) {
  const { translate } = useLanguage()

  return (
    <label
      htmlFor="video-file-input"
      className="focus-visible-within:border-primary/50 focus-visible-within:outline-none focus-visible-within:ring-2 focus-visible-within:ring-ring focus-visible-within:ring-offset-2 border-border bg-background hover:border-primary/50 hover:bg-accent/10 flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors"
      onDragOver={(dragEvent) => dragEvent.preventDefault()}
      onDrop={(dropEvent) => {
        dropEvent.preventDefault()
        onVideoFilesChange(dropEvent.dataTransfer.files)
      }}
    >
      <FileVideo className="text-muted-foreground size-12" aria-hidden="true" />
      <p className="text-muted-foreground mt-4 text-center text-sm">
        <span className="text-primary font-semibold">{translate('jobCard.upload.click')}</span>{' '}
        {translate('jobCard.upload.drag')}
      </p>
      <p id="video-file-formats" className="text-muted-foreground text-center text-xs">
        {translate('jobCard.upload.formats')}
      </p>
      <input
        ref={videoFileInputRef}
        id="video-file-input"
        type="file"
        accept="video/*"
        multiple
        className="sr-only"
        aria-label={translate('jobCard.upload.inputAriaLabel')}
        aria-describedby="video-file-formats"
        onChange={(changeEvent) => onVideoFilesChange(changeEvent.target.files)}
      />
    </label>
  )
}
