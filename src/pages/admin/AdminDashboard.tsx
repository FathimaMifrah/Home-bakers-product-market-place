/*
 File: src/pages/admin/AdminDashboard.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: AdminDashboard
 */

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getOrderStats } from '@/services/orderService'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { Users, ChefHat, ShoppingBag, DollarSign } from 'lucide-react'


// AdminDashboard: React page component for a top-level route view.
export default function AdminDashboard() {
  const { orders, users } = useMarketplace()
  const stats = getOrderStats(orders)
  const pendingBakers = users.filter((u) => u.role === 'baker' && u.isApproved === false)
  const recentOrders = orders.slice(0, 5)

  return (
    <DashboardLayout role="admin">
      <h1 className="mb-6 font-serif text-2xl font-bold">Admin Dashboard</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 p-4"><DollarSign className="text-primary size-8" /><div><p className="text-muted-foreground text-sm">Revenue</p><p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4"><ShoppingBag className="text-accent size-8" /><div><p className="text-muted-foreground text-sm">Orders</p><p className="text-2xl font-bold">{stats.totalOrders}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4"><Users className="text-primary size-8" /><div><p className="text-muted-foreground text-sm">Customers</p><p className="text-2xl font-bold">{users.filter((u) => u.role === 'customer').length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4"><ChefHat className="text-accent size-8" /><div><p className="text-muted-foreground text-sm">Bakers</p><p className="text-2xl font-bold">{users.filter((u) => u.role === 'baker').length}</p></div></CardContent></Card>
      </div>
      {pendingBakers.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Baker Approvals</CardTitle>
            <Button variant="outline" size="sm" asChild><Link to="/admin/bakers">Manage</Link></Button>
          </CardHeader>
          <CardContent>
            {pendingBakers.map((baker) => (
              <div key={baker.id} className="mb-2 flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-medium">{baker.bakeryName}</p><p className="text-muted-foreground text-sm">{baker.email}</p></div>
                <Badge variant="outline">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild><Link to="/admin/orders">View All</Link></Button>
        </CardHeader>
        <CardContent>
          {recentOrders.map((order) => (
            <div key={order.id} className="mb-2 flex items-center justify-between rounded-lg border p-3">
              <div><p className="font-medium">{order.customerName} &rarr; {order.bakerName}</p><p className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</p></div>
              <div className="flex items-center gap-3"><OrderStatusBadge status={order.status} /><span className="font-medium">{formatCurrency(order.total)}</span></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}