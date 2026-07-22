/*
 File: src/components/ui/input.tsx
 Purpose: Reusable React UI component.
 Main exports: Exports or main definitions
 */

import * as React from 'react'
import { cn } from '@/lib/utils'


// Input: Helper or component used in this file.
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'border-input h-11 w-full rounded-2xl border bg-secondary/80 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-sm outline-none transition focus-visible:border-primary focus-visible:bg-secondary focus-visible:ring-primary/30 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}

export { Input }