'use client'

import type { ComponentPropsWithoutRef, ComponentRef, ReactElement, Ref } from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { mergeClassNames } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

function ToastViewport({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> & {
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Viewport>>
}) {
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={mergeClassNames(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]',
        className
      )}
      {...props}
    />
  )
}

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

function Toast({
  ref,
  className,
  variant,
  ...props
}: ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants> & {
    ref?: Ref<ComponentRef<typeof ToastPrimitives.Root>>
  }) {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={mergeClassNames(toastVariants({ variant }), className)}
      {...props}
    />
  )
}

function ToastAction({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ToastPrimitives.Action> & {
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Action>>
}) {
  return (
    <ToastPrimitives.Action
      ref={ref}
      className={mergeClassNames(
        'ring-offset-background hover:bg-secondary focus-visible:ring-ring group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus-visible:ring-destructive inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

function ToastClose({
  ref,
  className,
  'aria-label': ariaLabel = 'Close notification',
  ...props
}: ComponentPropsWithoutRef<typeof ToastPrimitives.Close> & {
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Close>>
}) {
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={mergeClassNames(
        'text-foreground/50 hover:text-foreground absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none group-[.destructive]:focus-visible:ring-red-400 group-[.destructive]:focus-visible:ring-offset-red-600',
        className
      )}
      aria-label={ariaLabel}
      {...props}
    >
      <X className="size-4" aria-hidden="true" />
    </ToastPrimitives.Close>
  )
}

function ToastTitle({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ToastPrimitives.Title> & {
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Title>>
}) {
  return (
    <ToastPrimitives.Title
      ref={ref}
      className={mergeClassNames('text-sm font-semibold', className)}
      {...props}
    />
  )
}

function ToastDescription({
  ref,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ToastPrimitives.Description> & {
  ref?: Ref<ComponentRef<typeof ToastPrimitives.Description>>
}) {
  return (
    <ToastPrimitives.Description
      ref={ref}
      className={mergeClassNames('text-sm opacity-90', className)}
      {...props}
    />
  )
}

type ToastProps = ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = ReactElement<typeof ToastAction>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastClose,
  ToastTitle,
  ToastDescription,
  type ToastProps,
  type ToastActionElement
}
