'use client'

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/provider'

export default function QueueLimitWarning() {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="px-6 pb-4 pt-0 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border/50">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <p className="flex-1">{t('queueCard.limitationWarning')}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground/70 hover:text-foreground transition-colors -mr-1 p-0.5 rounded-sm hover:bg-background/50"
        >
          <X className="w-3.5 h-3.5" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}
