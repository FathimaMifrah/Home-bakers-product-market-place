/*
 File: src/services/productService.ts
 Purpose: Client-side API service helpers.
 Main exports: filterProducts
 */

import type { Product, ProductCategory } from '@/types'


// API_BASE: Helper or component used in this file.
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

async function parseApiError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string }
    return data.error || fallback
  } catch {
    return fallback
  }
}

// getAllProducts: Fetches data or reads values for the application.
export async function getAllProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE}/api/products`)
  if (!response.ok) throw new Error('Failed to fetch products')
  return await response.json()
}

// getProductById: Fetches data or reads values for the application.
export async function getProductById(id: string): Promise<Product | null> {
  const response = await fetch(`${API_BASE}/api/products/${id}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Failed to fetch product')
  return await response.json()
}

// getProductsByBaker: Fetches data or reads values for the application.
export async function getProductsByBaker(bakerId: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE}/api/products?bakerId=${bakerId}`)
  if (!response.ok) throw new Error('Failed to fetch products by baker')
  return await response.json()
}

// createProduct: Sends a create request or builds a new item.
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>,
): Promise<Product> {
  const response = await fetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to create product'))
  return await response.json()
}

// updateProduct: Updates an existing record or state item.
export async function updateProduct(
  id: string,
  data: Partial<Product>,
): Promise<Product | null> {
  const response = await fetch(`${API_BASE}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(await parseApiError(response, 'Failed to update product'))
  return await response.json()
}

// deleteProduct: Removes an item or record from the system.
export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/products/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete product')
}

// updateStock: Updates an existing record or state item.
export async function updateStock(
  id: string,
  quantityChange: number,
): Promise<Product | null> {
  const response = await fetch(`${API_BASE}/api/products/${id}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantityChange }),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Failed to update stock')
  return await response.json()
}

// decrementStockForOrder: Business logic helper or component for products/orders/reviews.
export async function decrementStockForOrder(
  items: { productId: string; quantity: number }[],
): Promise<void> {
  for (const item of items) {
    await updateStock(item.productId, -item.quantity)
  }
}

// filterProducts: Business logic helper or component for products/orders/reviews.
export function filterProducts(
  products: Product[],
  filters: {
    search?: string
    category?: ProductCategory | 'all'
    availableOnly?: boolean
    sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'name'
  },
): Product[] {
  let result = [...products]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
  }

  if (filters.category && filters.category !== 'all') {
    result = result.filter((p) => p.category === filters.category)
  }

  if (filters.availableOnly) {
    result = result.filter((p) => p.isAvailable && p.stock > 0)
  }

  switch (filters.sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
  }

  return result
}