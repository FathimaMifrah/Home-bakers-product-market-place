/*
 File: src/lib/validation.ts
 Purpose: Utility helper functions used across the app.
 Main exports: ValidateOrderParams, ValidationResult, validateOrder, calculateDeliveryFee
 */

import type { CartItem, DeliverySettings, Product } from '@/types'


export interface ValidateOrderParams {
  subtotal: number
  distance: number // calculated distance
  items: CartItem[]
  deliverySettings: DeliverySettings
  products: Product[]
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// validateOrder: Business logic helper or component for products/orders/reviews.
export function validateOrder(params: ValidateOrderParams): ValidationResult {
  const { subtotal, distance, items, deliverySettings, products } = params
  const errors: string[] = []

  // Check minimum order value
  if (subtotal < deliverySettings.minOrderValue) {
    errors.push(
      `Minimum order amount is Rs. ${deliverySettings.minOrderValue.toLocaleString()}.`,
    )
  }

  // Check delivery distance
  if (distance <= 0) {
    errors.push('Please enter a valid delivery distance.')
  } else if (distance > deliverySettings.maxDeliveryKm) {
    errors.push(
      `Delivery is available only within ${deliverySettings.maxDeliveryKm} km.`,
    )
  }

  // Check product availability
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) {
      errors.push(`Product "${item.name}" is no longer available.`)
      continue
    }
    if (!product.isAvailable) {
      errors.push(`"${product.name}" is currently out of stock.`)
    } else if (item.quantity > product.stock) {
      errors.push(
        `Only ${product.stock} unit(s) of "${product.name}" available (requested ${item.quantity}).`,
      )
    }
  }

  return { valid: errors.length === 0, errors }
}

// calculateDeliveryFee: Helper or component used in this file.
export function calculateDeliveryFee(
  distance: number,
  settings: DeliverySettings,
): number {
  if (distance <= 0) return 0
  return settings.baseDeliveryFee + distance * settings.deliveryFeePerKm
}

// validateEmail: Regex email validation matching strict specs
export function validateEmail(email: string): boolean {
  const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

// validatePhone: Checks if value is exactly 10 digits
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\d{10}$/
  return phoneRegex.test(phone)
}