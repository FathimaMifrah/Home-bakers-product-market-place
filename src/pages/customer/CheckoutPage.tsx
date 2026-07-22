/*
 File: src/pages/customer/CheckoutPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: CheckoutPage
 */

import type { DeliverySettings } from '@/types'
import { AlertTriangle, Loader2, MapPin, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createOrder, getDeliverySettings, initiatePayHerePayment } from '@/services/orderService'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'
import { getCoordinatesFromAddress, calculateDistance } from '@/services/geolocationService'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useEffect, useState } from 'react'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { useNavigate } from 'react-router-dom'
import { validateOrder, calculateDeliveryFee } from '@/lib/validation'


// CheckoutPage: React page component for a top-level route view.
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, getBakerIds, getItemsByBaker, clearBakerItems } = useCart()
  const { products, users, refreshOrders, refreshProducts } = useMarketplace()
  const bakerIds = getBakerIds()
  const [selectedBaker, setSelectedBaker] = useState(bakerIds[0] ?? '')
  const [address, setAddress] = useState(user?.address ?? '')
  const [distanceKm, setDistanceKm] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState<DeliverySettings | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('')

  useEffect(() => {
    if (selectedBaker) {
      getDeliverySettings(selectedBaker).then(setSettings)
    }
  }, [selectedBaker])

  useEffect(() => {
    if (bakerIds.length > 0 && !selectedBaker) {
      setSelectedBaker(bakerIds[0])
    }
  }, [bakerIds, selectedBaker])

  useEffect(() => {
    const updateCalculatedDistance = async () => {
      if (!address || !selectedBaker) return
      try {
        const bakerUser = users.find((u) => u.id === selectedBaker)
        let bakerLat = bakerUser?.latitude
        let bakerLon = bakerUser?.longitude

        if (bakerLat === undefined || bakerLon === undefined || bakerLat === null || bakerLon === null) {
          const bakerCoords = await getCoordinatesFromAddress(bakerUser?.address || '')
          if (bakerCoords) {
            bakerLat = bakerCoords.latitude
            bakerLon = bakerCoords.longitude
          }
        }

        const customerCoords = await getCoordinatesFromAddress(address)

        if (bakerLat !== undefined && bakerLon !== undefined && customerCoords) {
          const calculated = calculateDistance(
            bakerLat,
            bakerLon,
            customerCoords.latitude,
            customerCoords.longitude
          )
          setDistanceKm(calculated.toFixed(2))
        }
      } catch (err) {
        console.error('Failed to calculate distance automatically:', err)
      }
    }
    updateCalculatedDistance()
  }, [address, selectedBaker, users])

  const bakerItems = selectedBaker ? getItemsByBaker(selectedBaker) : []
  const subtotal = bakerItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const distance = parseFloat(distanceKm) || 0
  const baker = users.find((u) => u.id === selectedBaker)
  const deliveryFee = settings ? calculateDeliveryFee(distance, settings) : 0
  const total = subtotal + deliveryFee

  const runValidation = () => {
    if (!settings) return []
    const result = validateOrder({
      subtotal,
      distance,
      items: bakerItems,
      deliverySettings: settings,
      products,
    })
    setErrors(result.errors)
    return result.errors
  }

  useEffect(() => {
    if (!settings) return
    runValidation()
  }, [settings, distanceKm, subtotal, products, selectedBaker])

  const handlePlaceOrder = async () => {
    if (!user || !selectedBaker || !settings) return
    if (!paymentMethod) {
      toast.error('Payment method required', { description: 'Please select a payment method.' })
      return
    }
    const validationErrors = runValidation()
    if (validationErrors.length > 0) {
      toast.error('Order cannot proceed', { description: validationErrors[0] })
      return
    }

    setIsSubmitting(true)
    try {
      const createdOrder = await createOrder({
        customerId: user.id,
        customerName: user.name,
        bakerId: selectedBaker,
        bakerName: baker?.bakeryName ?? baker?.name ?? '',
        items: bakerItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        deliveryFee,
        total,
        status: 'pending',
        deliveryAddress: address,
        distanceKm: distance,
        paymentMethod,
        paymentStatus: 'Pending',
      })

      clearBakerItems(selectedBaker)
      await refreshOrders()
      await refreshProducts()

      if (paymentMethod === 'Cash on Delivery') {
        toast.success('Your order has been placed successfully. Please pay when your order is delivered.')
        navigate('/customer/orders')
      } else {
        toast.info('Initiating sandbox payment...')

        // Start PayHere sandbox checkout
        initiatePayHerePayment({
          orderId: createdOrder.id,
          amount: total,
          customerName: user.name,
          email: user.email,
          phone: user.phone || '',
          address: address,
          bakerName: baker?.bakeryName ?? baker?.name ?? '',
          onCompleted: async (orderId) => {
            await refreshOrders()
            toast.success('Payment completed & order confirmed successfully!')
            navigate(`/customer/orders/${orderId}`)
          },
          onDismissed: () => {
            toast.warning('Payment window closed. You can pay later from your orders list.')
            navigate(`/customer/orders/${createdOrder.id}`)
          },
          onError: (error) => {
            toast.error('Payment Error', { description: error })
            navigate(`/customer/orders/${createdOrder.id}`)
          }
        })
      }

    } catch (err) {
      toast.error('Failed to place order', { description: err instanceof Error ? err.message : 'Unknown error' })
      setIsSubmitting(false)
    }
  }


  const numericDistance = parseFloat(distanceKm)
  const isValid =
    address.trim() &&
    !Number.isNaN(numericDistance) &&
    numericDistance > 0 &&
    errors.length === 0 &&
    !!paymentMethod

  if (items.length === 0) {
    return (
      <DashboardLayout role="customer">
        <p className="text-muted-foreground py-12 text-center">Your cart is empty.</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <h1 className="mb-6 font-serif text-2xl font-bold">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Delivery Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {bakerIds.length > 1 && (
              <div className="space-y-2">
                <Label>Select Baker to Checkout</Label>
                <Select value={selectedBaker} onValueChange={setSelectedBaker}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {bakerIds.map((id) => {
                      const b = users.find((u) => u.id === id)
                      return <SelectItem key={id} value={id}>{b?.bakeryName ?? b?.name}</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Delivery Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                <Input 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="e.g., Colombo, Mount Lavinia" 
                  required 
                  className="pl-10"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Enter your delivery location (city/area name)</p>
            </div>

            <div className="space-y-2">
              <Label>Distance (km)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="e.g. 3"
              />
              <p className="text-[11px] text-muted-foreground">Automatically calculated from your address, or you can adjust it manually.</p>
            </div>

            {settings && (
              <div className="text-muted-foreground rounded-lg bg-muted p-3 text-xs">
                Min order: Rs. {settings.minOrderValue} | Max distance: {settings.maxDeliveryKm} km
              </div>
            )}

            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm font-semibold">Payment Method *</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PayHere')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'PayHere'
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-sm font-bold">Online Payment</span>
                  <span className="text-[10px] opacity-75 mt-0.5">Pay with PayHere</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-sm font-bold">Cash on Delivery</span>
                  <span className="text-[10px] opacity-75 mt-0.5">Pay when delivered</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {bakerItems.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(deliveryFee)}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">All products price + delivery fee = total</p>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                {errors.map((err) => (
                  <p key={err} className="text-destructive flex items-start gap-2 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {err}
                  </p>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              disabled={isSubmitting || !isValid}
              onClick={handlePlaceOrder}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Package className="mr-2 size-4" />
                  Place Order
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}