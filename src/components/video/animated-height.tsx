'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

interface AnimatedHeightProps {
  isOpen: boolean
  onTransitionEnd?: () => void
  innerClassName?: string
  children: ReactNode
}

export function AnimatedHeight({ isOpen, onTransitionEnd, innerClassName, children }: AnimatedHeightProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasMountedRef = useRef(false)
  const pendingExpandRef = useRef(false)

  useLayoutEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      if (isOpen) {
        pendingExpandRef.current = true
        requestAnimationFrame(() => {
          pendingExpandRef.current = false
          setIsExpanded(true)
        })
      }
      return
    }

    if (pendingExpandRef.current) return
    setIsExpanded(isOpen)
  }, [isOpen])

  return (
    <div
      className="grid ease-out transition-[grid-template-rows] duration-300"
      style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      onTransitionEnd={(transitionEndEvent) => {
        if (transitionEndEvent.propertyName === 'grid-template-rows') onTransitionEnd?.()
      }}
    >
      <div className="overflow-hidden min-h-0">
        <div className={innerClassName}>{children}</div>
      </div>
    </div>
  )
}
