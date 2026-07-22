/*
 File: src/pages/customer/OrdersPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: OrdersPage
 */

import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { useMarketplace } from '@/contexts/MarketplaceContext'


// OrdersPage: React page component for a top-level route view.
export default function OrdersPage() {
  const { user } = useAuth()
  const { orders } = useMarketplace()
  const myOrders = orders.filter((o) => o.customerId === user?.id)

  return (
    <DashboardLayout role="customer">
      <h1 className="mb-6 font-serif text-2xl font-bold">My Orders</h1>
      {myOrders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => (
            <Link key={order.id} to={`/customer/orders/${order.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{order.bakerName}</p>
                    <p className="text-muted-foreground text-sm">{formatDate(order.createdAt)} &middot; {order.items.length} item(s)</p>
                    <p className="text-xs text-muted-foreground">Baker ID: {order.bakerId}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payment: <span className="font-semibold text-foreground">{order.paymentMethod || 'PayHere'}</span> &middot; <span className="capitalize">{order.paymentStatus || 'Pending'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-bold">{formatCurrency(order.total)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}