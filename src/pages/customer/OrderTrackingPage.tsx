/*
 File: src/pages/customer/OrderTrackingPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: OrderTrackingPage
 */

import type { Order, Review, DeliveryAssignment } from '@/types'
import { ArrowLeft, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getOrderById, initiatePayHerePayment } from '@/services/orderService'
import { getReviewByOrder } from '@/services/reviewService'
import { submitDeliveryRating } from '@/services/deliveryService'
import { Link, useParams } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

// OrderTrackingPage: React page component for a top-level route view.
export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [review, setReview] = useState<Review | null>(null)
  const [deliveryAssignment, setDeliveryAssignment] = useState<DeliveryAssignment | null>(null)
  const [isPartnerRated, setIsPartnerRated] = useState(false)
  const [partnerRating, setPartnerRating] = useState(5)
  const [partnerComment, setPartnerComment] = useState('')
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false)
  const [isPaying, setIsPaying] = useState(false)

  const loadData = async () => {
    if (!id) return
    try {
      const o = await getOrderById(id)
      setOrder(o)
      
      const r = await getReviewByOrder(id)
      setReview(r)

      // Load assignment
      const assRes = await fetch(`${API_BASE}/api/delivery-assignments`)
      if (assRes.ok) {
        const assignments: DeliveryAssignment[] = await assRes.json()
        const match = assignments.find(a => a.order_id === id)
        if (match) setDeliveryAssignment(match)
      }

      // Check if rated
      const ratingsRes = await fetch(`${API_BASE}/api/delivery-ratings`)
      if (ratingsRes.ok) {
        const ratings = await ratingsRes.json()
        const hasRating = ratings.some((r: any) => r.order_id === id && r.customer_id === user?.id)
        setIsPartnerRated(hasRating)
      }
    } catch {}
  }

  useEffect(() => {
    loadData()
  }, [id, user])

  const handlePayNow = async () => {
    if (!order || !user) return
    setIsPaying(true)
    initiatePayHerePayment({
      orderId: order.id,
      amount: order.total,
      customerName: user.name,
      email: user.email,
      phone: user.phone || '',
      address: order.deliveryAddress,
      bakerName: order.bakerName,
      onCompleted: async (orderId) => {
        toast.success('Payment completed successfully!')
        await loadData()
        setIsPaying(false)
      },
      onDismissed: () => {
        toast.warning('Payment window closed.')
        setIsPaying(false)
      },
      onError: (error) => {
        toast.error('Payment failed', { description: error })
        setIsPaying(false)
      }
    })
  }


  if (!order) {
    return (
      <DashboardLayout role="customer">
        <p className="text-muted-foreground">Loading...</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <Link to="/customer/orders" className="text-muted-foreground mb-4 inline-flex items-center gap-2 text-sm hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to Orders
      </Link>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">Order #{order.id.slice(-6)}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p><span className="text-muted-foreground">Order ID:</span> {order.id}</p>
            <p><span className="text-muted-foreground">Customer ID:</span> {order.customerId}</p>
            <p><span className="text-muted-foreground">Baker ID:</span> {order.bakerId}</p>
            <p><span className="text-muted-foreground">Baker:</span> {order.bakerName}</p>
            <p><span className="text-muted-foreground">Date:</span> {formatDate(order.createdAt)}</p>
            <p><span className="text-muted-foreground">Address:</span> {order.deliveryAddress}</p>
            <p><span className="text-muted-foreground">Distance:</span> {order.distanceKm} km</p>
            <p><span className="text-muted-foreground">Payment Method:</span> {order.paymentMethod || 'PayHere'}</p>
            <p><span className="text-muted-foreground">Payment Status:</span> <span className="capitalize">{order.paymentStatus || 'Pending'}</span></p>
            <div className="border-t pt-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t pt-3 font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Order Status</CardTitle></CardHeader>
          <CardContent>
            {order.status === 'pending' && (
              <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3 dark:border-amber-500/30 dark:bg-amber-950/20">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Payment Required</p>
                <p className="text-xs text-muted-foreground">This order is pending payment. You can pay securely using PayHere sandbox checkout simulation.</p>
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  onClick={handlePayNow}
                  disabled={isPaying}
                >
                  {isPaying ? 'Opening Sandbox Checkout...' : 'Pay with PayHere (Sandbox)'}
                </Button>
              </div>
            )}
            <OrderTimeline status={order.status} />
            {order.status === 'delivered' && !review && (
              <Button className="mt-6 w-full" asChild>
                <Link to={`/customer/orders/${order.id}/review`}>Leave a Review</Link>
              </Button>
            )}
            {review && (
              <div className="mt-6 rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Your Review ({review.rating}/5)</p>
                <p className="text-muted-foreground text-sm">{review.comment}</p>
              </div>
            )}

            {/* Delivery Tracking Segment */}
            {deliveryAssignment && (
              <div className="mt-6 border-t pt-6 space-y-4">
                <h4 className="font-serif text-lg font-bold">Delivery Status</h4>
                
                {/* Driver Info */}
                {deliveryAssignment.delivery_partner_id && (
                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border/20 mb-4 space-y-2">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Assigned Delivery Partner</p>
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {deliveryAssignment.partnerName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{deliveryAssignment.partnerName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Phone: {deliveryAssignment.partnerPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {deliveryAssignment.status === 'failed' && (
                  <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs font-semibold">
                    ⚠️ Delivery Attempt Failed: {deliveryAssignment.failureReason}
                  </div>
                )}

                {/* Stepper */}
                <div className="relative pl-6 border-l-2 border-border space-y-6 py-1 ml-3">
                  {[
                    { key: 'assigned', label: 'Driver Assigned', desc: 'A delivery partner has been assigned' },
                    { key: 'picked_up', label: 'Picked Up', desc: 'Driver picked up the order from the bakery' },
                    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Driver is on the way to your address' },
                    { key: 'delivered', label: 'Delivered', desc: 'Order successfully delivered!' }
                  ].map((stage, idx) => {
                    const stages = ['assigned', 'picked_up', 'out_for_delivery', 'delivered']
                    const currentIdx = stages.indexOf(deliveryAssignment.status)
                    const stageIdx = stages.indexOf(stage.key)
                    
                    const isCompleted = currentIdx >= stageIdx && deliveryAssignment.status !== 'pending_assignment'
                    const isCurrent = deliveryAssignment.status === stage.key
                    
                    return (
                      <div key={stage.key} className="relative">
                        <div className={`absolute -left-[31px] top-1 size-3 rounded-full border bg-background transition-all ${
                          isCompleted 
                            ? (isCurrent ? 'border-primary ring-4 ring-primary/10 bg-primary' : 'border-emerald-500 bg-emerald-500') 
                            : 'border-muted-foreground/30'
                        }`} />
                        
                        <div>
                          <p className={`text-xs font-bold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {stage.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{stage.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Rate Delivery Partner */}
            {deliveryAssignment && deliveryAssignment.status === 'delivered' && deliveryAssignment.delivery_partner_id && (
              <>
                {!isPartnerRated ? (
                  <div className="mt-6 border-t pt-6 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rate your Delivery Partner</p>
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setPartnerRating(star)}
                              className="focus:outline-none"
                            >
                              <Star className={`size-4 transition-all ${partnerRating >= star ? 'fill-amber-400 text-amber-400 scale-110' : 'text-muted-foreground/30'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="partner-comment" className="text-xs font-semibold">Feedback (Optional)</Label>
                        <Input 
                          id="partner-comment"
                          value={partnerComment}
                          onChange={(e) => setPartnerComment(e.target.value)}
                          placeholder="Share your delivery experience..."
                          className="rounded-xl text-xs h-9"
                        />
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full rounded-xl text-xs font-bold mt-2" 
                        onClick={async () => {
                          if (!user || !deliveryAssignment.delivery_partner_id) return
                          setIsRatingSubmitting(true)
                          try {
                            const res = await submitDeliveryRating(
                              order.id,
                              deliveryAssignment.delivery_partner_id,
                              user.id,
                              partnerRating,
                              partnerComment
                            )
                            if (res.success) {
                              toast.success('Thank you for rating your delivery partner!')
                              setIsPartnerRated(true)
                            }
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to submit rating')
                          } finally {
                            setIsRatingSubmitting(false)
                          }
                        }}
                        disabled={isRatingSubmitting}
                      >
                        {isRatingSubmitting ? 'Submitting...' : 'Submit Driver Rating'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 border-t pt-6">
                    <p className="text-[10px] font-medium text-emerald-600 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 text-center">
                      ✅ You have rated your delivery partner. Thank you!
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}