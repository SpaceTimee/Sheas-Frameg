'use client'

import type { ComponentPropsWithoutRef, ComponentRef, Ref } from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { mergeClassNames } from '@/lib/utils'

function Progress({
  ref,
  className,
  value,
  max = 100,
  ...props
}: ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  ref?: Ref<ComponentRef<typeof ProgressPrimitive.Root>>
}) {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      max={max}
      className={mergeClassNames('bg-secondary relative h-4 w-full overflow-hidden rounded-full', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - ((value ?? 0) / max) * 100}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
