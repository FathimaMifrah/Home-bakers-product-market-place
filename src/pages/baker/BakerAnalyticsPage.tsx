/*
 File: src/pages/baker/BakerAnalyticsPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: BakerAnalyticsPage
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'
import { getOrderStats } from '@/services/orderService'
import { useAuth } from '@/contexts/AuthContext'
import { useMarketplace } from '@/contexts/MarketplaceContext'


// COLORS: Helper or component used in this file.
const COLORS = ['oklch(0.55 0.15 45)', 'oklch(0.65 0.12 60)', 'oklch(0.45 0.08 140)', 'oklch(0.7 0.1 80)']

// BakerAnalyticsPage: React page component for a top-level route view.
export default function BakerAnalyticsPage() {
  const { user } = useAuth()
  const { orders, products } = useMarketplace()
  const myOrders = orders.filter((o) => o.bakerId === user?.id)
  const myProducts = products.filter((p) => p.bakerId === user?.id)
  const stats = getOrderStats(myOrders)

  const topProducts = myProducts
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5)
    .map((p) => ({ name: p.name.slice(0, 15), sales: p.reviewCount * 3 }))

  const statusData = [
    { name: 'Delivered', value: myOrders.filter((o) => o.status === 'delivered').length },
    { name: 'Pending', value: myOrders.filter((o) => o.status === 'pending').length },
    { name: 'In Progress', value: myOrders.filter((o) => !['delivered', 'pending', 'cancelled'].includes(o.status)).length },
    { name: 'Cancelled', value: myOrders.filter((o) => o.status === 'cancelled').length },
  ].filter((d) => d.value > 0)

  return (
    <DashboardLayout role="baker">
      <h1 className="mb-6 font-serif text-2xl font-bold">Analytics</h1>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-muted-foreground text-sm">Total Revenue</p><p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground text-sm">Total Orders</p><p className="text-2xl font-bold">{stats.totalOrders}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-muted-foreground text-sm">Completed</p><p className="text-2xl font-bold">{stats.completedOrders}</p></CardContent></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="oklch(0.55 0.15 45)" radius={[4, 4, 0, 0]} />
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