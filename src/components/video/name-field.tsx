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
      <div className="flex max-w-full min-w-0 items-center gap-1">
        <div className="flex max-w-full min-w-0 items-center">
          <div className="relative inline-flex min-h-[1.5em] min-w-2 items-center overflow-hidden">
            <span className="invisible leading-[1.5] font-medium whitespace-pre" aria-hidden="true">
              {draftStem}
            </span>
            <input
              ref={inputRef}
              value={draftStem}
              maxLength={128}
              spellCheck={false}
              autoComplete="off"
              enterKeyHint="done"
              className="border-border focus:border-primary absolute inset-0 w-full border-b bg-transparent px-0 py-0 text-center font-medium focus:outline-none"
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
          {extension && <span className="text-muted-foreground shrink-0 font-medium">{extension}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label={translate('nameField.confirmAriaLabel')}
            onClick={confirmRename}
          >
            <Check className="text-muted-foreground hover:text-primary size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label={translate('nameField.cancelAriaLabel')}
            onClick={cancelRename}
            onMouseDown={(mouseDownEvent) => mouseDownEvent.preventDefault()}
          >
            <X className="text-muted-foreground hover:text-destructive size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    )
  }

  const { stem } = splitFileName(displayName)

  return (
    <div className="flex max-w-full min-w-0 items-center gap-1">
      <p className="flex min-w-0 items-baseline gap-0 font-medium">
        <span className="block min-w-0 overflow-hidden text-clip whitespace-nowrap">{stem}</span>
        {extension && <span className="text-muted-foreground shrink-0">{extension}</span>}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0"
        aria-label={translate('nameField.renameAriaLabel')}
        onClick={startRename}
      >
        <Pencil className="text-muted-foreground hover:text-primary size-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}

export default memo(NameField)
