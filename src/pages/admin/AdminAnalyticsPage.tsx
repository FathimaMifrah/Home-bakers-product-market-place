/*
 File: src/pages/admin/AdminAnalyticsPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: AdminAnalyticsPage
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'
import { getOrderStats } from '@/services/orderService'
import { useMarketplace } from '@/contexts/MarketplaceContext'


// COLORS: Helper or component used in this file.
const COLORS = ['oklch(0.55 0.15 45)', 'oklch(0.65 0.12 60)', 'oklch(0.45 0.08 140)', 'oklch(0.7 0.1 80)', 'oklch(0.6 0.14 30)']

// AdminAnalyticsPage: React page component for a top-level route view.
export default function AdminAnalyticsPage() {
  const { orders, users } = useMarketplace()
  const stats = getOrderStats(orders)

  const topBakers = users
    .filter((u) => u.role === 'baker' && u.isApproved)
    .sort((a, b) => (b.totalOrders ?? 0) - (a.totalOrders ?? 0))
    .slice(0, 5)
    .map((b) => ({ name: (b.bakeryName ?? b.name).slice(0, 12), orders: b.totalOrders ?? 0 }))

  const statusData = [
    { name: 'Delivered', value: orders.filter((o) => o.status === 'delivered').length },
    { name: 'Pending', value: orders.filter((o) => o.status === 'pending').length },
    { name: 'In Progress', value: orders.filter((o) => !['delivered', 'pending', 'cancelled'].includes(o.status)).length },
    { name: 'Cancelled', value: orders.filter((o) => o.status === 'cancelled').length },
  ].filter((d) => d.value > 0)

  return (
    <DashboardLayout role="admin">
      <h1 className="mb-6 font-serif text-2xl font-bold">Analytics & Reports</h1>
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-muted-foreground text-sm">Total Revenue</p><p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground text-sm">Total Orders</p><p className="text-2xl font-bold">{stats.totalOrders}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground text-sm">Pending</p><p className="text-2xl font-bold">{stats.pendingOrders}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground text-sm">Completed</p><p className="text-2xl font-bold">{stats.completedOrders}</p></CardContent></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Bakers</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topBakers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="oklch(0.55 0.15 45)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}