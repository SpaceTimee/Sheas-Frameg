'use client'

import { useState } from 'react'

export function useAnimatedList<T extends { id: string }>(items: T[]) {
  const [leavingItems, setLeavingItems] = useState<T[]>([])
  const [prevItems, setPrevItems] = useState(items)

  const currentIds = new Set(items.map((item) => item.id))
  const survivingLeaving = leavingItems.filter((item) => !currentIds.has(item.id))
  const survivingLeavingIds = new Set(survivingLeaving.map((item) => item.id))
  const newlyRemoved = prevItems.filter(
    (item) => !currentIds.has(item.id) && !survivingLeavingIds.has(item.id)
  )
  const mergedLeaving = [...survivingLeaving, ...newlyRemoved]

  if (newlyRemoved.length > 0) setLeavingItems(mergedLeaving)
  if (prevItems !== items) setPrevItems(items)

  const animatedItems = [
    ...items.map((item) => ({ item, isOpen: true as const })),
    ...mergedLeaving.map((item) => ({ item, isOpen: false as const }))
  ]

  const handleTransitionEnd = (id: string) =>
    setLeavingItems((currentLeaving) => currentLeaving.filter((item) => item.id !== id))

  return { animatedItems, handleTransitionEnd }
}
