/*
 File: src/components/orders/OrderStatusBadge.tsx
 Purpose: Reusable React UI component.
 Main exports: OrderStatusBadge
 */

import type { OrderStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS } from '@/lib/constants'


const statusVariants: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'secondary',
  preparing: 'default',
  out_for_delivery: 'default',
  delivered: 'secondary',
  cancelled: 'destructive',
}

// OrderStatusBadge: Business logic helper or component for products/orders/reviews.
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={statusVariants[status]}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  )
}