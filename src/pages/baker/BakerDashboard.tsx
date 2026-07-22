/*
 File: src/pages/baker/BakerDashboard.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: BakerDashboard
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DollarSign, ShoppingBag, Package, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getOrderStats } from '@/services/orderService'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { useMemo } from 'react'


// BakerDashboard: React page component for a top-level route view.
export default function BakerDashboard() {
  const { user } = useAuth()
  const { orders, products } = useMarketplace()
  const myOrders = orders.filter((o) => o.bakerId === user?.id)
  const myProducts = products.filter((p) => p.bakerId === user?.id)
  const stats = getOrderStats(myOrders)
  const pending = myOrders.filter((o) => o.status === 'pending')

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const data = []
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayName = days[d.getDay()]
      const dateString = d.toISOString().split('T')[0]
      
      const ordersCount = myOrders.filter((o) => o.createdAt.startsWith(dateString)).length
      data.push({ day: dayName, orders: ordersCount })
    }
    return data
  }, [myOrders])

  return (
    <DashboardLayout role="baker">
      <h1 className="mb-6 font-serif text-2xl font-bold">{user?.bakeryName ?? 'Baker Dashboard'}</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <DollarSign className="text-primary size-8" />
            <div>
              <p className="text-muted-foreground text-sm">Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <ShoppingBag className="text-accent size-8" />
            <div>
              <p className="text-muted-foreground text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="text-primary size-8" />
            <div>
              <p className="text-muted-foreground text-sm">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Package className="text-accent size-8" />
            <div>
              <p className="text-muted-foreground text-sm">Products</p>
              <p className="text-2xl font-bold">{myProducts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Orders</CardTitle>
            <Button variant="outline" size="sm" asChild><Link to="/baker/orders">View All</Link></Button>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending orders</p>
            ) : (
              pending.slice(0, 3).map((order) => (
                <div key={order.id} className="mb-3 flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-medium">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Weekly Orders</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="oklch(0.55 0.15 45)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}