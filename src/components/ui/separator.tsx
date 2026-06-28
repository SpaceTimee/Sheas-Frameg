'use client'

import type { ComponentPropsWithoutRef, ComponentRef, Ref } from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { mergeClassNames } from '@/lib/utils'

function Separator({
  ref,
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
  ref?: Ref<ComponentRef<typeof SeparatorPrimitive.Root>>
}) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      orientation={orientation}
      decorative={decorative}
      className={mergeClassNames(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  )
}

export { Separator }
