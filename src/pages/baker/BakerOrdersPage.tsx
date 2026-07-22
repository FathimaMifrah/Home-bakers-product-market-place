/*
 File: src/pages/baker/BakerOrdersPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: BakerOrdersPage
 */

import type { OrderStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/constants'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { updateOrderStatus } from '@/services/orderService'
import { useAuth } from '@/contexts/AuthContext'
import { useMarketplace } from '@/contexts/MarketplaceContext'


// BakerOrdersPage: React page component for a top-level route view.
export default function BakerOrdersPage() {
  const { user } = useAuth()
  const { orders, refreshOrders } = useMarketplace()
  const myOrders = orders.filter((o) => o.bakerId === user?.id)

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status)
    await refreshOrders()
    toast.success('Order status updated')
  }

  const handleAccept = async (orderId: string) => {
    await updateOrderStatus(orderId, 'confirmed')
    await refreshOrders()
    toast.success('Order accepted')
  }

  return (
    <DashboardLayout role="baker">
      <h1 className="mb-6 font-serif text-2xl font-bold">Incoming Orders</h1>
      <div className="space-y-4">
        {myOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-muted-foreground text-sm">{formatDate(order.createdAt)} &middot; {order.deliveryAddress}</p>
                  <p className="text-xs text-muted-foreground">Customer ID: {order.customerId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-bold">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="mb-3 text-sm">
                {order.items.map((item) => (
                  <span key={item.productId} className="mr-3">{item.name} x{item.quantity}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <>
                    <Button size="sm" onClick={() => handleAccept(order.id)}>Accept</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleStatusChange(order.id, 'cancelled')}>Reject</Button>
                  </>
                )}
                {order.status !== 'pending' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <Select onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Update status" /></SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.filter((s) => s !== 'pending' && s !== 'cancelled').map((s) => (
                        <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {myOrders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
      </div>
    </DashboardLayout>
  )
}