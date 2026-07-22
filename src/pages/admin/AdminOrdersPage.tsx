/*
 File: src/pages/admin/AdminOrdersPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: AdminOrdersPage
 */

import type { OrderStatus, User } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/constants'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateOrderStatus } from '@/services/orderService'
import { getDeliveryPartners, assignDeliveryPartner } from '@/services/deliveryService'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { useEffect, useState } from 'react'

// AdminOrdersPage: React page component for a top-level route view.
export default function AdminOrdersPage() {
  const { orders, refreshOrders } = useMarketplace()
  const [partners, setPartners] = useState<User[]>([])
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [targetOrderId, setTargetOrderId] = useState('')
  const [selectedPartnerId, setSelectedPartnerId] = useState('')

  useEffect(() => {
    getDeliveryPartners().then(setPartners).catch(() => {})
  }, [])

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status)
    await refreshOrders()
    toast.success('Order status updated')
  }

  const handleAssignClick = (orderId: string) => {
    setTargetOrderId(orderId)
    setSelectedPartnerId('')
    setIsAssignOpen(true)
  }

  const handleAssignSubmit = async () => {
    if (!targetOrderId || !selectedPartnerId) return
    try {
      const res = await assignDeliveryPartner(targetOrderId, selectedPartnerId)
      if (res.success) {
        toast.success('Delivery partner assigned successfully')
        setIsAssignOpen(false)
        await refreshOrders()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign partner')
    }
  }

  const availableDrivers = partners.filter((p) => p.isActive && p.availabilityStatus === 'available')

  return (
    <DashboardLayout role="admin">
      <h1 className="mb-6 font-serif text-2xl font-bold">All Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{order.customerName} &rarr; {order.bakerName}</p>
                <p className="text-muted-foreground text-sm">{formatDate(order.createdAt)} &middot; {order.items.length} item(s)</p>
                <p className="text-xs text-muted-foreground">Customer ID: {order.customerId} | Baker ID: {order.bakerId}</p>
                <p className="text-xs text-muted-foreground">
                  Payment: <span className={`font-semibold ${order.paymentMethod === 'Cash on Delivery' ? 'text-primary' : 'text-foreground'}`}>{order.paymentMethod || 'PayHere'}</span> &middot; <span className="capitalize font-semibold">{order.paymentStatus || 'Pending'}</span>
                </p>
                <p className="text-xs text-muted-foreground">Delivery Address: {order.deliveryAddress || 'N/A'}</p>
                <div className="mt-1">
                  <span className="font-bold">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready_for_delivery') && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-44"
                    onClick={() => handleAssignClick(order.id)}
                  >
                    Assign Delivery Partner
                  </Button>
                )}
                <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Update Status" /></SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manual Assignment Modal */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">Assign Delivery Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select an available delivery partner to manually assign to this order.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="driver-select-orders">Available Drivers</Label>
              <select
                id="driver-select-orders"
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full rounded-xl h-11 px-4 border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select a driver...</option>
                {availableDrivers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.vehicleType} (★ {p.rating || '5.00'})
                  </option>
                ))}
              </select>
              {availableDrivers.length === 0 && (
                <p className="text-[10px] text-rose-500 font-medium">
                  ⚠️ No drivers are currently online and available.
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl h-10 text-xs font-bold" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button 
              className="rounded-xl h-10 text-xs font-bold" 
              onClick={handleAssignSubmit}
              disabled={!selectedPartnerId}
            >
              Assign Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}