'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/provider'
import { splitFileName } from '@/lib/utils'

interface NameFieldProps {
  displayName: string
  fileName: string
  onRename: (customName: string) => void
}

function NameField({ displayName, fileName, onRename }: NameFieldProps) {
  const { translate } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [draftStem, setDraftStem] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isEditingRef = useRef(false)

  const { extension } = splitFileName(fileName)

  useEffect(() => {
    if (!isEditing) return

    isEditingRef.current = true
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [isEditing])

  const startRename = () => {
    setDraftStem(splitFileName(displayName).stem)
    setIsEditing(true)
  }

  const confirmRename = () => {
    if (!isEditingRef.current) return
    isEditingRef.current = false
    onRename(draftStem.trim())
    setIsEditing(false)
  }

  const cancelRename = () => {
    isEditingRef.current = false
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 min-w-0 max-w-full">
        <div className="flex items-center min-w-0 max-w-full">
          <div className="relative inline-flex min-w-2 min-h-[1.5em] items-center overflow-hidden">
            <span className="font-medium invisible whitespace-pre leading-[1.5]" aria-hidden="true">
              {draftStem}
            </span>
            <input
              ref={inputRef}
              value={draftStem}
              maxLength={128}
              spellCheck={false}
              autoComplete="off"
              enterKeyHint="done"
              className="font-medium text-center bg-transparent border-b border-border focus:border-primary focus:outline-none px-0 py-0 absolute inset-0 w-full"
              aria-label={translate('nameField.editAriaLabel')}
              onChange={(changeEvent) => setDraftStem(changeEvent.target.value)}
              onBlur={confirmRename}
              onKeyDown={(keyDownEvent) => {
                if (keyDownEvent.key === 'Enter') {
                  keyDownEvent.preventDefault()
                  confirmRename()
                } else if (keyDownEvent.key === 'Escape') {
                  keyDownEvent.preventDefault()
                  cancelRename()
                }
              }}
            />
          </div>
          {extension && <span className="font-medium text-muted-foreground shrink-0">{extension}</span>}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={translate('nameField.confirmAriaLabel')}
            onClick={confirmRename}
          >
            <Check className="h-4 w-4 text-muted-foreground hover:text-primary" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label={translate('nameField.cancelAriaLabel')}
            onClick={cancelRename}
            onMouseDown={(mouseDownEvent) => mouseDownEvent.preventDefault()}
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-destructive" aria-hidden="true" />
          </Button>
        </div>
      </div>
    )
  }

  const { stem } = splitFileName(displayName)

  return (
    <div className="flex items-center gap-1 min-w-0 max-w-full">
      <p className="font-medium min-w-0 flex items-baseline gap-0">
        <span className="overflow-hidden whitespace-nowrap text-clip min-w-0 block">{stem}</span>
        {extension && <span className="text-muted-foreground shrink-0">{extension}</span>}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        aria-label={translate('nameField.renameAriaLabel')}
        onClick={startRename}
      >
        <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" aria-hidden="true" />
      </Button>
    </div>
  )
}

export default memo(NameField)
