'use client'

import { FileVideo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/provider'

interface FileUploaderProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileChange: (files: FileList | null) => void
}

export default function FileUploader({ fileInputRef, onFileChange }: FileUploaderProps) {
  const { t } = useLanguage()

  return (
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
  )
}
