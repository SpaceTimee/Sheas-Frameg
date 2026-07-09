'use client'

import { AlertCircle, X } from 'lucide-react'
import { AnimatedHeight } from '@/components/video/animated-height'
import { useLanguage } from '@/lib/i18n/provider'

interface ProcessingWarningProps {
  isVisible: boolean
  onDismiss: () => void
}

export default function ProcessingWarning({ isVisible, onDismiss }: ProcessingWarningProps) {
  const { translate } = useLanguage()

  return (
    <AnimatedHeight isOpen={isVisible} innerClassName="pb-6">
      <div
        role="note"
        className="border-border/50 bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs"
      >
        <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
        <p className="flex-1">{translate('queueCard.limitationWarning')}</p>
        <button
          type="button"
          className="text-muted-foreground/70 hover:bg-background/50 hover:text-foreground focus-visible:ring-ring -mr-1 rounded-sm p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label={translate('queueCard.closeWarningAriaLabel')}
          onClick={onDismiss}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </AnimatedHeight>
  )
}
