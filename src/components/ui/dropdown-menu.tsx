'use client'

import type { ComponentPropsWithoutRef, ComponentRef, Ref } from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check } from 'lucide-react'
import { mergeClassNames } from '@/lib/utils'

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

function DropdownMenuContent({
  ref,
  className,
  sideOffset = 4,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
  ref?: Ref<ComponentRef<typeof DropdownMenuPrimitive.Content>>
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={(node) => {
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
          if (!node) return
          requestAnimationFrame(() => {
            node.querySelector<HTMLElement>('[role="menuitemradio"][data-state="checked"]')?.focus()
          })
        }}
        sideOffset={sideOffset}
        className={mergeClassNames(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md',
          className
        )}
        {...props}
        onCloseAutoFocus={(event) => event.preventDefault()}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuRadioItem({
  ref,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> & {
  ref?: Ref<ComponentRef<typeof DropdownMenuPrimitive.RadioItem>>
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={mergeClassNames(
        'focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <DropdownMenuPrimitive.ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
        <Check className="size-4" aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuContent,
  DropdownMenuRadioItem
}
