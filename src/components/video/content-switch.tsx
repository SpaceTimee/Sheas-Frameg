'use client'

import { useState, type ReactNode } from 'react'

interface ContentSwitchProps<K extends string> {
  contentKey: K
  renderContent: (key: K) => ReactNode
}

export function ContentSwitch<K extends string>({ contentKey, renderContent }: ContentSwitchProps<K>) {
  const [phase, setPhase] = useState<'expanded' | 'collapsing'>('expanded')
  const [displayedKey, setDisplayedKey] = useState(contentKey)

  if (phase === 'expanded' && contentKey !== displayedKey) {
    setPhase('collapsing')
  }

  return (
    <div
      className="grid ease-out transition-[grid-template-rows] duration-300"
      style={{ gridTemplateRows: phase === 'expanded' ? '1fr' : '0fr' }}
      onTransitionEnd={(transitionEndEvent) => {
        if (transitionEndEvent.propertyName !== 'grid-template-rows') return
        if (phase !== 'collapsing') return
        setDisplayedKey(contentKey)
        setPhase('expanded')
      }}
    >
      <div className="overflow-hidden min-h-0">{renderContent(displayedKey)}</div>
    </div>
  )
}
