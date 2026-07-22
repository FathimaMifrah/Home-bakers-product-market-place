/*
 File: src/data/seed.ts
 Purpose: Beginner-friendly source file.
 Main exports: seedUsers, seedProducts, seedOrders, seedReviews, seedDeliverySettings
 */

import type { DeliverySettings, Order, Product, Review, StoredUser } from '@/types'


export const seedUsers: StoredUser[] = []
export const seedProducts: Product[] = []
export const seedOrders: Order[] = []
export const seedReviews: Review[] = []
export const seedDeliverySettings: DeliverySettings[] = []