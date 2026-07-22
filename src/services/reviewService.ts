/*
 File: src/services/reviewService.ts
 Purpose: Client-side API service helpers.
 Main exports: Exports or main definitions
 */

import type { Review } from '@/types'


// API_BASE: Helper or component used in this file.
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

// getAllReviews: Fetches data or reads values for the application.
export async function getAllReviews(): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/api/reviews`)
  if (!res.ok) throw new Error('API Error')
  return await res.json()
}

// getReviewsByProduct: Fetches data or reads values for the application.
export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  const reviews = await getAllReviews()
  return reviews.filter((r) => r.productId === productId)
}

// getReviewByOrder: Fetches data or reads values for the application.
export async function getReviewByOrder(orderId: string): Promise<Review | null> {
  const reviews = await getAllReviews()
  return reviews.find((r) => r.orderId === orderId) ?? null
}

// createReview: Sends a create request or builds a new item.
export async function createReview(data: {
  orderId: string
  productId: string
  customerId: string
  customerName: string
  rating: number
  comment: string
}): Promise<Review> {
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create review')
  return await res.json()
}