/*
 File: src/services/orderService.ts
 Purpose: Client-side API service helpers.
 Main exports: getOrderStats
 */

import type { DeliverySettings, Order, OrderStatus } from '@/types'


// API_BASE: Helper or component used in this file.
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

// getAllOrders: Fetches data or reads values for the application.
export async function getAllOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/orders`)
  if (!res.ok) throw new Error('API error')
  const orders: Order[] = await res.json()
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// getOrderById: Fetches data or reads values for the application.
export async function getOrderById(id: string): Promise<Order | null> {
  const res = await fetch(`${API_BASE}/api/orders/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('API error')
  return await res.json()
}

// getOrdersByCustomer: Fetches data or reads values for the application.
export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/orders`)
  if (!res.ok) throw new Error('API error')
  const orders: Order[] = await res.json()
  return orders
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// getOrdersByBaker: Fetches data or reads values for the application.
export async function getOrdersByBaker(bakerId: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/orders`)
  if (!res.ok) throw new Error('API error')
  const orders: Order[] = await res.json()
  return orders
    .filter((o) => o.bakerId === bakerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// createOrder: Sends a create request or builds a new item.
export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let errMsg = 'Failed to create order'
    try {
      const body = await res.json()
      if (body && body.error) errMsg = body.error
    } catch {}
    throw new Error(errMsg)
  }
  const order = await res.json()
  return order
}

// updateOrderStatus: Updates an existing record or state item.
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | null> {
  const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to update order status')
  return await res.json()
}

// getDeliverySettings: Fetches data or reads values for the application.
export async function getDeliverySettings(
  bakerId: string,
): Promise<DeliverySettings> {
  const res = await fetch(`${API_BASE}/api/delivery-settings/${bakerId}`)
  if (!res.ok) {
    return {
      bakerId,
      minOrderValue: 500,
      maxDeliveryKm: 10,
      deliveryFeePerKm: 50,
      baseDeliveryFee: 150,
    }
  }
  return await res.json()
}

// updateDeliverySettings: Updates an existing record or state item.
export async function updateDeliverySettings(
  bakerId: string,
  data: Partial<Omit<DeliverySettings, 'bakerId'>>,
): Promise<DeliverySettings> {
  const res = await fetch(`${API_BASE}/api/delivery-settings/${bakerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update delivery settings')
  return await res.json()
}

/**
 * Calculate distance between baker and customer location using backend
 */
export async function calculateDistance(
  bakerId: string,
  customerLatitude: number,
  customerLongitude: number,
): Promise<number> {
  const res = await fetch(`${API_BASE}/api/calculate-distance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bakerId,
      customerLatitude,
      customerLongitude,
    }),
  })
  if (!res.ok) throw new Error('Failed to calculate distance')
  const data = await res.json()
  return data.distance
}

// getOrderStats: Fetches data or reads values for the application.
export function getOrderStats(orders: Order[]) {
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const completedOrders = orders.filter((o) => o.status === 'delivered').length
  return { totalRevenue, pendingOrders, completedOrders, totalOrders: orders.length }
}

export interface PayHerePaymentConfig {
  orderId: string
  amount: number
  customerName: string
  email: string
  phone: string
  address: string
  bakerName: string
  onCompleted: (orderId: string) => void
  onDismissed: () => void
  onError: (error: string) => void
}

export async function initiatePayHerePayment(config: PayHerePaymentConfig) {
  try {
    const res = await fetch(`${API_BASE}/api/payment/hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: config.orderId, amount: config.amount })
    })
    if (!res.ok) throw new Error('Failed to generate payment signature')
    const { hash, merchantId } = await res.json()

    const payhere = (window as any).payhere

    if (!payhere) {
      throw new Error('PayHere SDK is not loaded')
    }

    payhere.onCompleted = async function onCompleted(orderId: string) {
      try {
        await fetch(`${API_BASE}/api/orders/${orderId}/confirm-payment`, {
          method: 'POST'
        })
        config.onCompleted(orderId)
      } catch (err) {
        config.onError('Payment succeeded but order confirmation failed. Please contact support.')
      }
    }

    payhere.onDismissed = function onDismissed() {
      config.onDismissed()
    }

    payhere.onError = function onError(error: any) {
      config.onError(error || 'Payment failed')
    }

    const nameParts = config.customerName.split(' ')
    const firstName = nameParts[0] || 'Customer'
    const lastName = nameParts.slice(1).join(' ') || 'User'

    const paymentDetails = {
      sandbox: true,
      merchant_id: merchantId,
      return_url: `${window.location.origin}/customer/orders/${config.orderId}`,
      cancel_url: `${window.location.origin}/customer/orders/${config.orderId}`,
      notify_url: `${API_BASE}/api/payment/notify`,
      order_id: config.orderId,
      items: `Order from ${config.bakerName}`,
      amount: config.amount,
      currency: 'LKR',
      first_name: firstName,
      last_name: lastName,
      email: config.email || 'customer@example.com',
      phone: config.phone || '0771234567',
      address: config.address || 'Sri Lanka',
      city: config.address || 'Colombo',
      country: 'Sri Lanka',
      hash: hash
    }

    payhere.startPayment(paymentDetails)
  } catch (err: any) {
    config.onError(err.message || 'Failed to start payment')
  }
}