/*
 File: src/components/ui/textarea.tsx
 Purpose: Reusable React UI component.
 Main exports: Exports or main definitions
 */

import * as React from 'react'
import { cn } from '@/lib/utils'


// Textarea: Helper or component used in this file.
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'border-input min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }