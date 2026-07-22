/*
 File: src/pages/delivery/DeliveryDashboard.tsx
 Purpose: React page component that renders the delivery partner overview dashboard.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  getDeliveryStatsForPartner, 
  getDeliveryAssignmentsForPartner, 
  updateDeliveryPartnerStatus,
  type PartnerStats 
} from '@/services/deliveryService'
import type { DeliveryAssignment } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { 
  DollarSign, 
  ShoppingBag, 
  CheckCircle, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react'

export default function DeliveryDashboard() {
  const { user, login } = useAuth()
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([])
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>('offline')
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const [s, a] = await Promise.all([
        getDeliveryStatsForPartner(user.id),
        getDeliveryAssignmentsForPartner(user.id)
      ])
      setStats(s)
      setAssignments(a.slice(0, 5)) // show top 5 recent assignments
      setAvailability(user.availabilityStatus || 'offline')
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleStatusChange = async (newStatus: 'available' | 'busy' | 'offline') => {
    if (!user) return
    try {
      const updatedUser = await updateDeliveryPartnerStatus(user.id, newStatus)
      if (updatedUser) {
        setAvailability(newStatus)
        // Update local session user status
        user.availabilityStatus = newStatus
        toast.success(`Availability status updated to ${newStatus}`)
      }
    } catch (err) {
      toast.error('Failed to update availability status')
    }
  }

  // Active status color helper
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
      case 'busy':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
      case 'offline':
        return 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getAssignmentStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200">Assigned</Badge>
      case 'picked_up':
        return <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-200">Picked Up</Badge>
      case 'out_for_delivery':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">Out for Delivery</Badge>
      case 'delivered':
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</Badge>
      case 'failed':
        return <Badge variant="destructive" className="bg-rose-50 text-rose-700 border border-rose-200">Failed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  if (isLoading && !stats) {
    return (
      <DashboardLayout role="delivery_partner">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="delivery_partner">
      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border border-border/40 bg-card p-6 shadow-soft md:flex-row md:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here's your delivery activity summary for today.
          </p>
        </div>

        {/* Availability Controls */}
        <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-2 border border-border/20">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-2 pr-1">
            Status:
          </span>
          <div className="flex gap-1">
            {(['available', 'busy', 'offline'] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={availability === status ? 'default' : 'ghost'}
                onClick={() => handleStatusChange(status)}
                className={`rounded-xl text-xs font-medium capitalize px-3 py-1.5 h-auto transition-all ${
                  availability === status
                    ? 'shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card className="rounded-3xl shadow-soft border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today's Earnings
            </CardTitle>
            <DollarSign className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats?.todayEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From completed deliveries today
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-soft border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent blur-xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Assigned
            </CardTitle>
            <ShoppingBag className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall assigned deliveries
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-soft border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent blur-xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Pickups
            </CardTitle>
            <Clock className="size-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Waiting to be picked up
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-soft border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent blur-xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              In-Transit
            </CardTitle>
            <Activity className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.inTransit || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active deliveries out on road
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-soft border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Delivered
            </CardTitle>
            <CheckCircle className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.completed || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-600 font-medium">
              Success rate: {stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 100}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Panel - Recent Assignments */}
      <Card className="rounded-3xl shadow-soft border-border/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-serif text-xl font-bold">Recent Deliveries</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Your 5 most recent delivery assignments</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold" asChild>
            <Link to="/delivery/orders" className="flex items-center gap-1.5">
              View All Assignments <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {assignments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Baker</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        #{assignment.orderId.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{assignment.customerName}</TableCell>
                      <TableCell className="text-sm">
                        <span className="font-medium">{assignment.bakeryName || assignment.bakerName}</span>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate text-muted-foreground">
                        {assignment.deliveryAddress}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {formatCurrency(assignment.deliveryFee || 0)}
                      </TableCell>
                      <TableCell>{getAssignmentStatusBadge(assignment.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="rounded-xl text-xs font-semibold" asChild>
                          <Link to="/delivery/orders">Manage</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCheck className="size-12 text-muted-foreground/30 mb-3" />
              <h3 className="font-serif text-lg font-bold text-foreground">No active assignments</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                You do not have any delivery assignments. Switch your availability to <strong>Available</strong> to receive automatic matching!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
