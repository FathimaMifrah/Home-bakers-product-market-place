/*
 File: src/contexts/MarketplaceContext.tsx
 Purpose: React context provider for shared app state.
 Main exports: MarketplaceProvider, useMarketplace, useBakerName
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getAllOrders } from '@/services/orderService'
import { getAllProducts } from '@/services/productService'
import { getAllUsers } from '@/services/authService'
import { toast } from 'sonner'
import type { Order, Product, User } from '@/types'

interface MarketplaceContextType {
  products: Product[]
  orders: Order[]
  users: User[]
  isLoading: boolean
  refreshProducts: () => Promise<void>
  refreshOrders: () => Promise<void>
  refreshUsers: () => Promise<void>
  refreshAll: () => Promise<void>
}

// MarketplaceContext: Helper or component used in this file.
const MarketplaceContext = createContext<MarketplaceContextType | undefined>(
  undefined,
)

// MarketplaceProvider: React provider component that wraps child components and shares state.
export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshProducts = useCallback(async () => {
    try {
      setProducts(await getAllProducts())
    } catch {
      toast.error('Could not load products. Is the API server running? (npm run server)')
    }
  }, [])

  const refreshOrders = useCallback(async () => {
    try {
      setOrders(await getAllOrders())
    } catch {
      toast.error('Could not load orders. Is the API server running?')
    }
  }, [])

  const refreshUsers = useCallback(async () => {
    try {
      setUsers(await getAllUsers())
    } catch {
      toast.error('Could not load users. Is the API server running?')
    }
  }, [])

  const refreshAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const [p, o, u] = await Promise.all([
        getAllProducts(),
        getAllOrders(),
        getAllUsers(),
      ])
      setProducts(p)
      setOrders(o)
      setUsers(u)
    } catch {
      setProducts([])
      setOrders([])
      setUsers([])
      toast.error(
        'Cannot connect to the server. Start MySQL, then run: npm run server',
        { duration: 8000 },
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  return (
    <MarketplaceContext.Provider
      value={{
        products,
        orders,
        users,
        isLoading,
        refreshProducts,
        refreshOrders,
        refreshUsers,
        refreshAll,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  )
}

// useMarketplace: Custom React hook for shared state or behavior.
export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (!context)
    throw new Error('useMarketplace must be used within MarketplaceProvider')
  return context
}

// useBakerName: Custom React hook for shared state or behavior.
export function useBakerName(bakerId: string): string {
  const { users } = useMarketplace()
  const baker = users.find((u) => u.id === bakerId)
  return baker?.bakeryName ?? baker?.name ?? 'Unknown Baker'
}