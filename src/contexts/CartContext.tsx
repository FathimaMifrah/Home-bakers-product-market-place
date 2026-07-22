/*
 File: src/contexts/CartContext.tsx
 Purpose: React context provider for shared app state.
 Main exports: CartProvider, useCart
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { STORAGE_KEYS } from '@/lib/constants'
import { getItem, setItem } from '@/lib/storage'
import type { CartItem } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  clearBakerItems: (bakerId: string) => void
  getItemsByBaker: (bakerId: string) => CartItem[]
  getBakerIds: () => string[]
}

// CartContext: Cart-related state management function or component.
const CartContext = createContext<CartContextType | undefined>(undefined)

// CartProvider: React provider component that wraps child components and shares state.
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loadedUserId, setLoadedUserId] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<CartItem[]>([])

  const cartKey = user ? `cart_${user.id}` : 'cart_guest'

  // Load cart when user changes
  useEffect(() => {
    const savedItems = getItem<CartItem[]>(cartKey, [])
    setItems(savedItems)
    setLoadedUserId(user?.id)
  }, [user?.id, cartKey])

  // Save cart when items change, only if state is in sync with current user ID
  useEffect(() => {
    if (loadedUserId === user?.id) {
      setItem(cartKey, items)
    }
  }, [items, cartKey, loadedUserId, user?.id])

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setItems((previousItems) => {
        const existingItem = previousItems.find((cartItem) => cartItem.productId === item.productId)
        if (existingItem) {
          return previousItems.map((cartItem) =>
            cartItem.productId === item.productId
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem,
          )
        }
        return [...previousItems, { ...item, quantity }]
      })
    },
    [],
  )

  const removeItem = useCallback((productId: string) => {
    setItems((previousItems) => previousItems.filter((i) => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((previousItems) => previousItems.filter((i) => i.productId !== productId))
      return
    }
    setItems((previousItems) =>
      previousItems.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const clearBakerItems = useCallback((bakerId: string) => {
    setItems((previousItems) => previousItems.filter((i) => i.bakerId !== bakerId))
  }, [])

  const getItemsByBaker = useCallback(
    (bakerId: string) => items.filter((i) => i.bakerId === bakerId),
    [items],
  )

  const getBakerIds = useCallback(
    () => [...new Set(items.map((i) => i.bakerId))],
    [items],
  )

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  )

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearBakerItems,
        getItemsByBaker,
        getBakerIds,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// useCart: Custom React hook for shared state or behavior.
export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}