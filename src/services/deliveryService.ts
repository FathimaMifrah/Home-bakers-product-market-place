/*
 File: src/services/deliveryService.ts
 Purpose: Client-side API service helpers for managing delivery partners, assignments, stats, and reviews.
 */

import type { DeliveryAssignment, DeliveryAssignmentStatus, User } from '@/types'

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

// Fetch all delivery partners (admin use)
export async function getDeliveryPartners(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/api/delivery-partners`)
  if (!res.ok) throw new Error('Failed to fetch delivery partners')
  return await res.json()
}

// Create a delivery partner (admin use)
export async function createDeliveryPartner(data: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/api/delivery-partners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create delivery partner')
  }
  return await res.json()
}

// Update a delivery partner profile details
export async function updateDeliveryPartnerProfile(id: string, data: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/api/delivery-partners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update delivery partner profile')
  return await res.json()
}

// Update availability status (available, busy, offline)
export async function updateDeliveryPartnerStatus(id: string, availabilityStatus: 'available' | 'busy' | 'offline'): Promise<User> {
  const res = await fetch(`${API_BASE}/api/delivery-partners/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availabilityStatus }),
  })
  if (!res.ok) throw new Error('Failed to update availability status')
  return await res.json()
}

// Get all delivery assignments (admin use)
export async function getDeliveryAssignments(): Promise<DeliveryAssignment[]> {
  const res = await fetch(`${API_BASE}/api/delivery-assignments`)
  if (!res.ok) throw new Error('Failed to fetch delivery assignments')
  return await res.json()
}

// Get delivery assignments for a specific delivery partner
export async function getDeliveryAssignmentsForPartner(partnerId: string): Promise<DeliveryAssignment[]> {
  const res = await fetch(`${API_BASE}/api/delivery-assignments/partner/${partnerId}`)
  if (!res.ok) throw new Error('Failed to fetch assignments')
  return await res.json()
}

// Manually assign a delivery partner to an order
export async function assignDeliveryPartner(orderId: string, deliveryPartnerId: string): Promise<{ success: boolean; assignmentId: string }> {
  const res = await fetch(`${API_BASE}/api/delivery-assignments/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, deliveryPartnerId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to assign delivery partner')
  }
  return await res.json()
}

// Update delivery assignment status (assigned -> picked_up -> out_for_delivery -> delivered -> failed)
export async function updateDeliveryAssignmentStatus(
  assignmentId: string,
  status: DeliveryAssignmentStatus,
  comments?: string,
  updatedBy?: string,
  failureReason?: string
): Promise<{ success: boolean; status: DeliveryAssignmentStatus }> {
  const res = await fetch(`${API_BASE}/api/delivery-assignments/${assignmentId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, comments, updatedBy, failureReason }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update delivery status')
  }
  return await res.json()
}

// Submit a delivery rating
export async function submitDeliveryRating(
  orderId: string,
  deliveryPartnerId: string,
  customerId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; ratingId: string }> {
  const res = await fetch(`${API_BASE}/api/delivery-ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, deliveryPartnerId, customerId, rating, comment }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to submit rating')
  }
  return await res.json()
}

// Get overall delivery stats (admin use)
export interface DeliveryStats {
  partners: {
    total: number
    available: number
    busy: number
    offline: number
  }
  deliveries: {
    total: number
    pending: number
    assigned: number
    pickedUp: number
    outForDelivery: number
    completed: number
    failed: number
  }
  todayEarnings: number
}

export async function getDeliveryStats(): Promise<DeliveryStats> {
  const res = await fetch(`${API_BASE}/api/delivery-stats`)
  if (!res.ok) throw new Error('Failed to fetch delivery statistics')
  return await res.json()
}

// Get stats for a specific delivery partner
export interface PartnerStats {
  total: number
  pending: number
  inTransit: number
  completed: number
  failed: number
  todayEarnings: number
}

export async function getDeliveryStatsForPartner(partnerId: string): Promise<PartnerStats> {
  const res = await fetch(`${API_BASE}/api/delivery-stats/partner/${partnerId}`)
  if (!res.ok) throw new Error('Failed to fetch partner statistics')
  return await res.json()
}
