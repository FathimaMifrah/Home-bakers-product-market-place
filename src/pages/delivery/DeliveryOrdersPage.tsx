/*
 File: src/pages/delivery/DeliveryOrdersPage.tsx
 Purpose: React page component that lists and manages delivery assignments for a delivery partner.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  getDeliveryAssignmentsForPartner, 
  updateDeliveryAssignmentStatus 
} from '@/services/deliveryService'
import { getOrderById } from '@/services/orderService'
import type { DeliveryAssignment, Order, DeliveryAssignmentStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  User, 
  Store, 
  ShoppingBag, 
  CheckCircle,
  Truck,
  AlertCircle,
  Calendar,
  CreditCard,
  Hash
} from 'lucide-react'

export default function DeliveryOrdersPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<DeliveryAssignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<DeliveryAssignment | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  // Failure Modal state
  const [isFailOpen, setIsFailOpen] = useState(false)
  const [failReason, setFailReason] = useState('')

  const fetchAssignments = async () => {
    if (!user) return
    try {
      const data = await getDeliveryAssignmentsForPartner(user.id)
      setAssignments(data)
      setFilteredAssignments(data)
    } catch (err) {
      toast.error('Failed to load delivery assignments')
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [user])

  useEffect(() => {
    let result = assignments

    // Filter by search query (order ID, customer name, bakery name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (a) =>
          a.orderId.toLowerCase().includes(q) ||
          (a.customerName && a.customerName.toLowerCase().includes(q)) ||
          (a.bakeryName && a.bakeryName.toLowerCase().includes(q)) ||
          (a.bakerName && a.bakerName.toLowerCase().includes(q))
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }

    setFilteredAssignments(result)
  }, [searchQuery, statusFilter, assignments])

  const handleViewDetails = async (assignment: DeliveryAssignment) => {
    setSelectedAssignment(assignment)
    setIsDetailOpen(true)
    setSelectedOrder(null)
    try {
      const orderDetails = await getOrderById(assignment.order_id)
      setSelectedOrder(orderDetails)
    } catch {
      toast.error('Failed to fetch product items for this order')
    }
  }

  const handleUpdateStatus = async (assignmentId: string, status: DeliveryAssignmentStatus, comments?: string, failureReason?: string) => {
    if (!user) return
    setIsActionLoading(true)
    try {
      const result = await updateDeliveryAssignmentStatus(assignmentId, status, comments, user.id, failureReason)
      if (result.success) {
        toast.success(`Delivery status updated to ${status.replace('_', ' ')}`)
        setIsDetailOpen(false)
        setIsFailOpen(false)
        setFailReason('')
        fetchAssignments()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setIsActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50">Assigned</Badge>
      case 'picked_up':
        return <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-50">Picked Up</Badge>
      case 'out_for_delivery':
        return <Badge className="bg-purple-50 text-purple-700 border border-purple-200 animate-pulse hover:bg-purple-50">Out for Delivery</Badge>
      case 'delivered':
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">Delivered</Badge>
      case 'failed':
        return <Badge variant="destructive" className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50">Failed Delivery</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <DashboardLayout role="delivery_partner">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">Delivery Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and track your delivery assignments</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID, Customer, or Baker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 rounded-2xl h-11 bg-card border-border/40 placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { value: 'all', label: 'All' },
            { value: 'assigned', label: 'Assigned' },
            { value: 'picked_up', label: 'Picked Up' },
            { value: 'out_for_delivery', label: 'Out for Delivery' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'failed', label: 'Failed' }
          ].map((tab) => (
            <Button
              key={tab.value}
              size="sm"
              variant={statusFilter === tab.value ? 'default' : 'outline'}
              onClick={() => setStatusFilter(tab.value)}
              className="rounded-full text-xs font-semibold px-4 whitespace-nowrap h-9 border-border/40"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id} className="rounded-3xl border-border/40 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                  <Calendar className="size-3" /> {formatDate(assignment.orderDate || assignment.createdAt)}
                </span>
                <CardTitle className="font-mono text-sm font-semibold mt-1">
                  #{assignment.order_id.slice(-6).toUpperCase()}
                </CardTitle>
              </div>
              {getStatusBadge(assignment.status)}
            </CardHeader>
            <CardContent className="pb-4 space-y-3.5 flex-1">
              {/* Baker */}
              <div className="flex items-start gap-2.5">
                <Store className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pick Up From</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{assignment.bakeryName || assignment.bakerName}</p>
                </div>
              </div>

              {/* Customer Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deliver To</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{assignment.customerName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{assignment.deliveryAddress}</p>
                </div>
              </div>

              {/* Details line */}
              <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Distance</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">{assignment.distanceKm || 0} km</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivery Fee</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">{formatCurrency(assignment.deliveryFee || 0)}</p>
                </div>
              </div>
            </CardContent>
            <div className="border-t border-border/40 p-4 bg-muted/20 rounded-b-3xl">
              <Button 
                className="w-full rounded-2xl h-10 text-xs font-bold" 
                variant="outline"
                onClick={() => handleViewDetails(assignment)}
              >
                Manage Delivery
              </Button>
            </div>
          </Card>
        ))}

        {filteredAssignments.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="size-12 text-muted-foreground/30 mb-3" />
            <h3 className="font-serif text-lg font-bold text-foreground">No assignments found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Try adjusting your search query or status filter.
            </p>
          </div>
        )}
      </div>

      {/* Delivery Management Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="rounded-3xl max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold flex items-center justify-between">
              <span>Manage Delivery #{selectedAssignment?.order_id.slice(-6).toUpperCase()}</span>
              {selectedAssignment && getStatusBadge(selectedAssignment.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-5 py-2">
              {/* Pickup Contact Card */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/20 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Store className="size-3.5" /> Bakery Pickup
                </h4>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>{selectedAssignment.bakeryName || selectedAssignment.bakerName}</span>
                  <a href={`tel:${selectedAssignment.bakerPhone}`} className="text-xs font-bold text-primary flex items-center gap-1 border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-full hover:bg-primary hover:text-white transition-colors">
                    <Phone className="size-3" /> {selectedAssignment.bakerPhone || 'No number'}
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">
                  Verify the baked products are fresh and packed before loading.
                </p>
              </div>

              {/* Delivery Details Card */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/20 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> Customer Destination
                </h4>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>{selectedAssignment.customerName}</span>
                  <a href={`tel:${selectedAssignment.customerPhone}`} className="text-xs font-bold text-primary flex items-center gap-1 border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-full hover:bg-primary hover:text-white transition-colors">
                    <Phone className="size-3" /> {selectedAssignment.customerPhone || 'No number'}
                  </a>
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p className="font-medium text-foreground">Address:</p>
                  <p>{selectedAssignment.deliveryAddress}</p>
                </div>
                <div className="text-xs text-muted-foreground flex gap-4 pt-1">
                  <span><strong>Distance:</strong> {selectedAssignment.distanceKm} km</span>
                  <span><strong>Fee:</strong> {formatCurrency(selectedAssignment.deliveryFee || 0)}</span>
                </div>
              </div>

              {/* Order Items Summary */}
              {selectedOrder && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShoppingBag className="size-3.5" /> Items Checklist
                  </h4>
                  <div className="border border-border/40 rounded-2xl p-3 bg-card divide-y divide-border/20 text-xs">
                    {selectedOrder.items.map((item) => (
                      <div key={item.productId} className="flex justify-between py-2 first:pt-0 last:pb-0 font-medium">
                        <span className="text-foreground">{item.name} <strong className="text-primary">x{item.quantity}</strong></span>
                        <span className="text-muted-foreground">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2.5 font-bold text-sm text-foreground">
                      <span>Order Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-600 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                    <CreditCard className="size-3.5 shrink-0" />
                    <span>Payment Method: Cash on Delivery (COD) / Paid Online (Confirm with client)</span>
                  </div>
                </div>
              )}

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-border/40">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Update Work Status</p>
                
                <div className="flex flex-col gap-2">
                  {selectedAssignment.status === 'assigned' && (
                    <Button 
                      className="w-full rounded-2xl h-11 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white" 
                      onClick={() => handleUpdateStatus(selectedAssignment.id, 'picked_up', 'Picked up order from baker')}
                      disabled={isActionLoading}
                    >
                      <Hash className="size-4 mr-1.5" /> Mark as Picked Up
                    </Button>
                  )}

                  {selectedAssignment.status === 'picked_up' && (
                    <Button 
                      className="w-full rounded-2xl h-11 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white" 
                      onClick={() => handleUpdateStatus(selectedAssignment.id, 'out_for_delivery', 'Out for customer delivery')}
                      disabled={isActionLoading}
                    >
                      <Truck className="size-4 mr-1.5" /> Mark as Out for Delivery
                    </Button>
                  )}

                  {selectedAssignment.status === 'out_for_delivery' && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="rounded-2xl h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white" 
                        onClick={() => handleUpdateStatus(selectedAssignment.id, 'delivered', 'Successfully delivered to customer')}
                        disabled={isActionLoading}
                      >
                        <CheckCircle className="size-4 mr-1.5" /> Mark as Delivered
                      </Button>
                      <Button 
                        className="rounded-2xl h-11 text-xs font-bold" 
                        variant="destructive"
                        onClick={() => setIsFailOpen(true)}
                        disabled={isActionLoading}
                      >
                        <AlertCircle className="size-4 mr-1.5" /> Mark as Failed
                      </Button>
                    </div>
                  )}

                  {['delivered', 'failed'].includes(selectedAssignment.status) && (
                    <p className="text-xs text-center text-muted-foreground font-medium bg-muted py-2.5 rounded-xl border border-border/20">
                      This delivery assignment is finalized and cannot be modified.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Failure Reason Modal */}
      <Dialog open={isFailOpen} onOpenChange={setIsFailOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold text-destructive">Record Failed Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/70 uppercase">Failure Reason</label>
              <Textarea 
                placeholder="e.g. Customer unavailable, Address incorrect, Order refused..." 
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                className="rounded-2xl min-h-[90px] border-border/40 focus:ring-primary/20"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl h-10 text-xs font-bold" onClick={() => setIsFailOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              className="rounded-xl h-10 text-xs font-bold"
              onClick={() => {
                if (!selectedAssignment) return
                if (!failReason.trim()) {
                  toast.error('Please input a failure reason')
                  return
                }
                handleUpdateStatus(selectedAssignment.id, 'failed', `Failed: ${failReason}`, failReason)
              }}
              disabled={isActionLoading}
            >
              Submit Failure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
