import type { HTMLAttributes, Ref } from 'react'
import { mergeClassNames } from '@/lib/utils'

function Card({ ref, className, ...props }: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={mergeClassNames('bg-card text-card-foreground rounded-lg border shadow-sm', className)}
      {...props}
    />
  )
}

function CardHeader({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} className={mergeClassNames('flex flex-col space-y-1.5 p-6', className)} {...props} />
}

function CardTitle({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { ref?: Ref<HTMLHeadingElement> }) {
  return (
    <h3
      ref={ref}
      className={mergeClassNames('text-2xl leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

function CardDescription({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { ref?: Ref<HTMLParagraphElement> }) {
  return <p ref={ref} className={mergeClassNames('text-muted-foreground text-sm', className)} {...props} />
}

function CardContent({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} className={mergeClassNames('p-6 pt-0', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
