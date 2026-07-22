/*
 File: src/types/index.ts
 Purpose: TypeScript interface and type definitions.
 Main exports: UserRole, OrderStatus, ProductCategory, User, Product
 */

export type UserRole = 'customer' | 'baker' | 'admin' | 'delivery_partner'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'failed'

export type ProductCategory = 'sweet' | 'savory' | 'cakes' | 'seasonal'

export interface User {
  id: string
  referenceId?: string
  name: string
  email: string
  role: UserRole
  password?: string
  phone?: string
  address?: string
  avatar?: string
  isActive: boolean
  bakeryName?: string
  specialties?: string[]
  latitude?: number
  longitude?: number
  rating?: number
  totalOrders?: number
  isApproved?: boolean
  createdAt: string
  // Delivery Partner specific fields
  vehicleType?: 'bike' | 'scooter' | 'car'
  licenseNumber?: string
  availabilityStatus?: 'available' | 'busy' | 'offline'
  totalDeliveriesCompleted?: number
}

export interface Product {
  id: string
  bakerId: string
  name: string
  description: string
  price: number
  category: ProductCategory
  imageUrl: string
  stock: number
  isAvailable: boolean
  rating: number
  reviewCount: number
  createdAt: string
}

export interface CartItem {
  productId: string
  bakerId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  bakerId: string
  bakerName: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: OrderStatus
  deliveryAddress: string
  distanceKm: number
  paymentMethod?: string
  payment_method?: string
  paymentStatus?: string
  payment_status?: string
  createdAt: string
  updatedAt: string
}

export interface DeliverySettings {
  bakerId: string
  minOrderValue: number
  maxDeliveryKm: number
  deliveryFeePerKm: number
  baseDeliveryFee: number
}

export interface Review {
  id: string
  orderId: string
  productId: string
  customerId: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

export interface StoredUser extends User {
  password: string
}

export type DeliveryAssignmentStatus = 'pending_assignment' | 'assigned' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed'

export interface DeliveryAssignment {
  id: string
  orderId: string
  order_id: string
  deliveryPartnerId: string | null
  delivery_partner_id: string | null
  assignedBy: 'admin' | 'system'
  status: DeliveryAssignmentStatus
  assignedAt: string
  pickedUpAt?: string
  deliveredAt?: string
  failedAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
  // Joined fields
  customerName?: string
  bakerName?: string
  bakeryName?: string
  deliveryAddress?: string
  total?: number
  orderStatus?: OrderStatus
  distanceKm?: number
  subtotal?: number
  deliveryFee?: number
  orderDate?: string
  customerPhone?: string
  bakerPhone?: string
  partnerName?: string
  partnerPhone?: string
}