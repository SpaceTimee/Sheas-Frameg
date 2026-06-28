'use client'

import type { ComponentPropsWithoutRef, ComponentRef, Ref } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { mergeClassNames } from '@/lib/utils'

const Select = SelectPrimitive.Root

const SelectValue = SelectPrimitive.Value

function SelectTrigger({
  ref,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Trigger>>
}) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={mergeClassNames(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50 pointer-events-none shrink-0" aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectScrollUpButton({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> & {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.ScrollUpButton>>
}) {
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={mergeClassNames('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUp className="h-4 w-4" aria-hidden="true" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> & {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.ScrollDownButton>>
}) {
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={mergeClassNames('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDown className="h-4 w-4" aria-hidden="true" />
    </SelectPrimitive.ScrollDownButton>
  )
}

function SelectContent({
  ref,
  className,
  children,
  position = 'popper',
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Content>>
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={mergeClassNames(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={mergeClassNames(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  ref,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
  ref?: Ref<ComponentRef<typeof SelectPrimitive.Item>>
}) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={mergeClassNames(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText className="truncate">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem }
