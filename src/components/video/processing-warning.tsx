'use client'

import { AlertCircle, X } from 'lucide-react'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { useLanguage } from '@/lib/i18n/provider'

interface ProcessingWarningProps {
  isVisible: boolean
  onDismiss: () => void
}

export default function ProcessingWarning({ isVisible, onDismiss }: ProcessingWarningProps) {
  const { translate } = useLanguage()

  return (
    <Collapsible open={isVisible}>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div>
          <div
            role="note"
            className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border/50"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <p className="flex-1">{translate('queueCard.limitationWarning')}</p>
            <button
              type="button"
              className="-mr-1 rounded-sm p-0.5 text-muted-foreground/70 transition-colors hover:bg-background/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={translate('queueCard.closeWarningAriaLabel')}
              onClick={onDismiss}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
