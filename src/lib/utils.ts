/*
 File: src/lib/utils.ts
 Purpose: Utility helper functions used across the app.
 Main exports: cn, formatCurrency, formatDate, delay, generateId
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'


// cn: Helper or component used in this file.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// formatCurrency: Formats values for display in the UI.
export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`
}

// formatDate: Formats values for display in the UI.
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// delay: Helper or component used in this file.
export function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// generateId: Helper or component used in this file.
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}