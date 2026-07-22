/*
 File: src/lib/constants.ts
 Purpose: Utility helper functions used across the app.
 Main exports: DEFAULT_MIN_ORDER_VALUE, DEFAULT_MAX_DELIVERY_KM, DEFAULT_BASE_DELIVERY_FEE, DEFAULT_DELIVERY_FEE_PER_KM, LOW_STOCK_THRESHOLD
 */

import type { OrderStatus } from '@/types'


// DEFAULT_MIN_ORDER_VALUE: Helper or component used in this file.
export const DEFAULT_MIN_ORDER_VALUE = 500
// DEFAULT_MAX_DELIVERY_KM: Helper or component used in this file.
export const DEFAULT_MAX_DELIVERY_KM = 10
// DEFAULT_BASE_DELIVERY_FEE: Helper or component used in this file.
export const DEFAULT_BASE_DELIVERY_FEE = 150
// DEFAULT_DELIVERY_FEE_PER_KM: Helper or component used in this file.
export const DEFAULT_DELIVERY_FEE_PER_KM = 50
// LOW_STOCK_THRESHOLD: Helper or component used in this file.
export const LOW_STOCK_THRESHOLD = 5

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'failed',
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready_for_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed: 'Failed Delivery',
}

// PRODUCT_CATEGORIES: Helper or component used in this file.
export const PRODUCT_CATEGORIES = [
  { value: 'sweet', label: 'Buns & Sweets' },
  { value: 'savory', label: 'Breads' },
  { value: 'cakes', label: 'Cakes & Cupcakes' },
  { value: 'seasonal', label: 'Seasonal Specials' },
] as const

// STORAGE_KEYS: Helper or component used in this file.
export const STORAGE_KEYS = {
  users: 'hbm_users',
  session: 'hbm_session',
  products: 'hbm_products',
  orders: 'hbm_orders',
  reviews: 'hbm_reviews',
  deliverySettings: 'hbm_delivery_settings',
  cart: 'hbm_cart',
  initialized: 'hbm_initialized',
} as const