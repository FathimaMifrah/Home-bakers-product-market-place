/*
 File: src/components/layout/DashboardLayout.tsx
 Purpose: Reusable React UI component.
 Main exports: DashboardLayout
 */

import { Link, useLocation } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import {
  Home, ShoppingBag, Search, Settings, LogOut, Menu, X,
  ChefHat, Package, BarChart3, Users, Store, TrendingUp, DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

interface DashboardLayoutProps {
  children: ReactNode
  role: UserRole
}

const navigationItems: Record<UserRole, { label: string; href: string; icon: typeof Home }[]> = {
  customer: [
    { label: 'Overview', href: '/customer', icon: Home },
    { label: 'Browse', href: '/customer/browse', icon: Search },
    { label: 'My Orders', href: '/customer/orders', icon: ShoppingBag },
    { label: 'Cart', href: '/customer/cart', icon: ShoppingBag },
  ],
  baker: [
    { label: 'Overview', href: '/baker', icon: Home },
    { label: 'Products', href: '/baker/products', icon: Package },
    { label: 'Inventory', href: '/baker/inventory', icon: Store },
    { label: 'Orders', href: '/baker/orders', icon: ShoppingBag },
    { label: 'Delivery', href: '/baker/delivery', icon: Settings },
    { label: 'Analytics', href: '/baker/analytics', icon: BarChart3 },
  ],
  admin: [
    { label: 'Overview', href: '/admin', icon: Home },
    { label: 'Inventory', href: '/admin/inventory', icon: Package },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Bakers', href: '/admin/bakers', icon: ChefHat },
    { label: 'Orders & Deliveries', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Delivery Panel', href: '/admin/delivery', icon: Settings },
    { label: 'Salary Management', href: '/admin/salaries', icon: DollarSign },
    { label: 'Payments & Reports', href: '/admin/analytics', icon: TrendingUp },
  ],
  delivery_partner: [
    { label: 'Overview', href: '/delivery', icon: Home },
    { label: 'My Deliveries', href: '/delivery/orders', icon: ShoppingBag },
    { label: 'My Salary', href: '/delivery/salary', icon: DollarSign },
    { label: 'Profile Settings', href: '/delivery/profile', icon: Users },
  ],
}

const roleLabels: Record<UserRole, string> = {
  customer: 'Customer Portal',
  baker: 'Baker Dashboard',
  admin: 'Admin Console',
  delivery_partner: 'Delivery Dashboard',
}

// DashboardLayout: Helper or component used in this file.
export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const items = navigationItems[role]

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/60 bg-card shadow-soft transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b px-5">
          <Link to="/" className="font-serif text-lg font-bold">HomeBakers</Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="size-5" />
          </Button>
        </div>
        <p className="text-muted-foreground px-5 pt-4 text-xs font-medium uppercase tracking-wider">
          {roleLabels[role]}
        </p>
        <nav className="flex-1 space-y-1 p-4">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t p-4">
          <div className="mb-3">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            {user?.referenceId && (
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{user.referenceId}</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="w-full rounded-full" onClick={logout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="flex h-[72px] items-center gap-4 border-b border-border/60 bg-background/80 px-4 md:px-6 backdrop-blur-sm">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            &larr; Back to Home
          </Link>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}