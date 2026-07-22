/*
 File: src/components/ui/card.tsx
 Purpose: Reusable React UI component.
 Main exports: Exports or main definitions
 */

import * as React from 'react'
import { cn } from '@/lib/utils'


// Card: Helper or component used in this file.
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground shadow-soft flex flex-col gap-6 rounded-2xl border border-border/60 py-6',
        className,
      )}
      {...props}
    />
  )
}

// CardHeader: Helper or component used in this file.
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2 px-6', className)} {...props} />
}

// CardTitle: Helper or component used in this file.
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('font-serif font-semibold leading-none', className)} {...props} />
}

// CardDescription: Helper or component used in this file.
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('text-muted-foreground text-sm', className)} {...props} />
  )
}

// CardContent: Helper or component used in this file.
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-6', className)} {...props} />
}

// CardFooter: Helper or component used in this file.
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center px-6', className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }