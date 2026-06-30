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
      className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary/50 focus-visible-within:border-primary/50 focus-visible-within:outline-none focus-visible-within:ring-2 focus-visible-within:ring-ring focus-visible-within:ring-offset-2 bg-background hover:bg-accent/10 transition-colors"
      onDragOver={(dragEvent) => dragEvent.preventDefault()}
      onDrop={(dropEvent) => {
        dropEvent.preventDefault()
        onVideoFilesChange(dropEvent.dataTransfer.files)
      }}
    >
      <FileVideo className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      <p className="mt-4 text-sm text-center text-muted-foreground">
        <span className="font-semibold text-primary">{translate('jobCard.upload.click')}</span>{' '}
        {translate('jobCard.upload.drag')}
      </p>
      <p id="video-file-formats" className="text-xs text-center text-muted-foreground">
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
