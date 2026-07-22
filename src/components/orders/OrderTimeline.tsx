/*
 File: src/components/orders/OrderTimeline.tsx
 Purpose: Reusable React UI component.
 Main exports: OrderTimeline
 */

import type { OrderStatus } from '@/types'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/constants'


interface OrderTimelineProps {
  status: OrderStatus
}

// OrderTimeline: Business logic helper or component for products/orders/reviews.
export function OrderTimeline({ status }: OrderTimelineProps) {
  const currentIndex = ORDER_STATUSES.indexOf(status)
  const activeStatuses = ORDER_STATUSES.filter((s) => s !== 'cancelled')

  if (status === 'cancelled') {
    return (
      <div className="text-destructive rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        This order has been cancelled.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activeStatuses.map((s, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        return (
          <div key={s} className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle2 className={cn('size-5', isCurrent ? 'text-primary' : 'text-muted-foreground')} />
            ) : (
              <Circle className="text-muted-foreground size-5" />
            )}
            <span className={cn('text-sm', isCompleted ? 'font-medium' : 'text-muted-foreground')}>
              {ORDER_STATUS_LABELS[s]}
            </span>
          </div>
        )
      })}
    </div>
  )
}