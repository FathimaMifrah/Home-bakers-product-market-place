/*
 File: src/components/layout/ProtectedRoute.tsx
 Purpose: Reusable React UI component.
 Main exports: ProtectedRoute
 */

import type { UserRole } from '@/types'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'


interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

// ProtectedRoute: React route wrapper that controls navigation and access.
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap: Record<UserRole, string> = {
      customer: '/customer',
      baker: '/baker',
      admin: '/admin',
      delivery_partner: '/delivery',
    }
    return <Navigate to={redirectMap[user.role]} replace />
  }

  return <Outlet />
}