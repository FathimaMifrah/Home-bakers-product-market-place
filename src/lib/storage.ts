/*
 File: src/lib/storage.ts
 Purpose: Utility helper functions used across the app.
 Main exports: getItem, setItem, removeItem, clearMarketplaceData
 */

import { STORAGE_KEYS } from './constants'


// getItem: Fetches data or reads values for the application.
export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

// setItem: Helper or component used in this file.
export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// removeItem: Removes an item or record from the system.
export function removeItem(key: string): void {
  localStorage.removeItem(key)
}

// clearMarketplaceData: Helper or component used in this file.
export function clearMarketplaceData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}