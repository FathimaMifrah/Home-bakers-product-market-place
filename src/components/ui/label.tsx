/*
 File: src/components/ui/label.tsx
 Purpose: Reusable React UI component.
 Main exports: Exports or main definitions
 */

import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'
import { cn } from '@/lib/utils'


// Label: Helper or component used in this file.
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn('text-sm font-medium leading-none', className)}
      {...props}
    />
  )
}

export { Label }