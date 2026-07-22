/*
 File: src/pages/customer/CustomerDashboard.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: CustomerDashboard
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { ProductCard } from '@/components/products/ProductCard'
import { ShoppingBag, Package, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMarketplace } from '@/contexts/MarketplaceContext'


// CustomerDashboard: React page component for a top-level route view.
export default function CustomerDashboard() {
  const { user } = useAuth()
  const { orders, products, users } = useMarketplace()
  const myOrders = orders.filter((o) => o.customerId === user?.id)
  const recentOrders = myOrders.slice(0, 3)
  const recommended = products.filter((p) => p.isAvailable).slice(0, 4)

  const getBakerName = (bakerId: string) => {
    const baker = users.find((u) => u.id === bakerId)
    return baker?.bakeryName ?? baker?.name ?? ''
  }

  return (
    <DashboardLayout role="customer">
      <h1 className="mb-6 font-serif text-2xl font-bold">Welcome, {user?.name.split(' ')[0]}!</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <ShoppingBag className="text-primary size-8" />
            <div>
              <p className="text-muted-foreground text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{myOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="text-accent size-8" />
            <div>
              <p className="text-muted-foreground text-sm">Active Orders</p>
              <p className="text-2xl font-bold">{myOrders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Package className="text-primary size-8" />
            <div>
              <p className="text-muted-foreground text-sm">Products Available</p>
              <p className="text-2xl font-bold">{products.filter((p) => p.isAvailable).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild><Link to="/customer/orders">View All</Link></Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet. <Link to="/customer/browse" className="text-primary">View Catalog</Link></p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link key={order.id} to={`/customer/orders/${order.id}`} className="hover:bg-muted flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{order.bakerName}</p>
                    <p className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-medium">{formatCurrency(order.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-4 font-serif text-xl font-bold">Recommended for You</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recommended.map((product) => (
          <ProductCard key={product.id} product={product} bakerName={getBakerName(product.bakerId)} />
        ))}
      </div>
    </DashboardLayout>
  )
}