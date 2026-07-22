/*
 File: src/pages/customer/CartPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: CartPage
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'


// CartPage: React page component for a top-level route view.
export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart()

  if (items.length === 0) {
    return (
      <DashboardLayout role="customer">
        <div className="py-16 text-center">
          <ShoppingBag className="text-muted-foreground mx-auto mb-4 size-16" />
          <h2 className="mb-2 font-serif text-xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Add some delicious treats to get started!</p>
          <Button asChild><Link to="/customer/browse">Browse Products</Link></Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <h1 className="mb-6 font-serif text-2xl font-bold">Shopping Cart</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="flex items-center gap-4 p-4">
                <img src={item.imageUrl} alt={item.name} className="size-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-primary font-bold">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</Button>
                </div>
                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="rounded-lg border border-muted/30 bg-muted/10 p-3 text-sm text-muted-foreground">
              <p className="font-medium">Delivery charge will be added at checkout.</p>
              <p className="mt-1">Total at checkout = subtotal + delivery fee</p>
            </div>
            <Button className="w-full" asChild>
              <Link to="/customer/checkout">Proceed to Checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}