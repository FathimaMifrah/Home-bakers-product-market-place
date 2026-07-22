/*
 File: src/contexts/AuthContext.tsx
 Purpose: React context provider for shared app state.
 Main exports: AuthProvider, useAuth
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getSession,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
} from '@/services/authService'
import type { User, UserRole } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>
  register: (data: {
    name: string
    email: string
    password: string
    role: UserRole
    phone?: string
    address?: string
    bakeryName?: string
    specialties?: string[]
  }) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

// AuthContext: Authentication-related function or component.
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthProvider: React provider component that wraps child components and shares state.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(getSession())
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    const { user, error } = await authLogin(email, password, role)
    if (user) {
      setUser(user)
      return { ok: true }
    }
    return { ok: false, error }
  }

  const register = async (data: Parameters<AuthContextType['register']>[0]) => {
    const { user, error } = await authRegister(data)
    if (user) {
      setUser(user)
      return { ok: true }
    }
    if (error) console.warn('Register:', error)
    return { ok: false, error }
  }

  const logout = () => {
    authLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// useAuth: Custom React hook for shared state or behavior.
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}