/*
 File: src/services/authService.ts
 Purpose: Client-side API service helpers.
 Main exports: getSession, logout
 */

import type { User, UserRole } from '@/types'
import { getItem, setItem } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'


// API_BASE: Helper or component used in this file.
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

// login: Sends login credentials to the authentication API.
export async function login(
  email: string,
  password: string,
  role: UserRole,
): Promise<{ user: User | null; error?: string }> {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { user: null, error: (data as { error?: string }).error || 'Login failed' }
  }
  const user = data as User
  setItem(STORAGE_KEYS.session, user)
  return { user }
}

// register: Sends registration data to register a new user.
export async function register(data: {
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  address?: string
  bakeryName?: string
  specialties?: string[]
}): Promise<{ user: User | null; error?: string }> {
  const response = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { user: null, error: (body as { error?: string }).error || 'Registration failed' }
  }
  const user = body as User
  setItem(STORAGE_KEYS.session, user)
  return { user }
}

// getSession: Fetches data or reads values for the application.
export function getSession(): User | null {
  return getItem<User | null>(STORAGE_KEYS.session, null)
}

// logout: Helper or component used in this file.
export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.session)
}

// getAllUsers: Fetches data or reads values for the application.
export async function getAllUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE}/api/users`)
  if (!response.ok) throw new Error('API Error')
  return await response.json()
}

// getUsersByRole: Fetches data or reads values for the application.
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const response = await fetch(`${API_BASE}/api/users`)
  if (!response.ok) throw new Error('API Error')
  const users: User[] = await response.json()
  return users.filter((u) => u.role === role)
}

// updateUser: Updates an existing record or state item.
export async function updateUser(
  id: string,
  data: Partial<User>,
): Promise<User | null> {
  const response = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) return null
  const updated = await response.json()
  const session = getSession()
  if (session?.id === id) setItem(STORAGE_KEYS.session, updated)
  return updated
}

// toggleUserActive: Toggles a boolean state value for the current item.
export async function toggleUserActive(id: string): Promise<User | null> {
  const user = await getUserById(id)
  if (!user) return null
  return updateUser(id, { isActive: !user.isActive })
}

// approveBaker: Changes approval status for a baker or account.
export async function approveBaker(id: string): Promise<User | null> {
  return updateUser(id, { isApproved: true })
}

// rejectBaker: Changes approval status for a baker or account.
export async function rejectBaker(id: string): Promise<User | null> {
  return updateUser(id, { isApproved: false, isActive: false })
}

// getUserById: Fetches data or reads values for the application.
export async function getUserById(id: string): Promise<User | null> {
  const response = await fetch(`${API_BASE}/api/users/${id}`)
  if (!response.ok) throw new Error('API Error')
  return await response.json()
}