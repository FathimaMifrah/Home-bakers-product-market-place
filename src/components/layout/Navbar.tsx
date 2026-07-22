/*
 File: src/components/layout/Navbar.tsx
 Purpose: Reusable React UI component.
 Main exports: Navbar
 */

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'


// navLinks: Helper or component used in this file.
const navLinks = [
  { label: 'Catalog', href: '/products' },
  { label: 'About', href: '/', hash: 'about' },
]

// Navbar: Helper or component used in this file.
export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const dashboardPath =
    user?.role === 'customer'
      ? '/customer'
      : user?.role === 'baker'
      ? '/baker'
      : user?.role === 'delivery_partner'
      ? '/delivery'
      : '/admin'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/products?search=${encodeURIComponent(search)}`)
    setMobileOpen(false)
  }

  const isActive = (link: (typeof navLinks)[0]) => {
    if (link.href === '/products') return location.pathname === '/products'
    if (link.hash) {
      return location.pathname === '/' && location.hash === `#${link.hash}`
    }
    return location.pathname === link.href
  }

  const getNavTarget = (link: (typeof navLinks)[0]) => {
    if (link.hash) return { pathname: link.href, hash: `#${link.hash}` }
    return link.href
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 md:gap-6 md:px-6">
        <Link to="/" className="shrink-0 font-serif text-xl font-bold tracking-tight md:text-2xl">
          HomeBakers
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={getNavTarget(link)}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive(link)
                  ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
                  : 'text-muted-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="mx-auto hidden max-w-sm flex-1 md:block lg:max-w-md">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Search bakers, treats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-muted/80 h-11 w-full rounded-full border-0 pr-4 pl-11 text-sm outline-none ring-ring transition duration-200 focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated && user?.role === 'customer' && (
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/customer/cart')}>
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <Badge className="bg-rose text-rose-foreground absolute -top-1 -right-1 size-5 justify-center border-0 p-0 text-[10px]">
                  {itemCount}
                </Badge>
              )}
            </Button>
          )}
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate(dashboardPath)}>
                <User className="size-4" />
                {user?.name.split(' ')[0]}
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="size-4 sm:hidden" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate('/auth/register')}>
                Sign Up
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-background/95 px-4 py-4 lg:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Search bakers, treats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-muted/80 h-11 w-full rounded-full border-0 pr-4 pl-11 text-sm outline-none transition duration-200 focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={getNavTarget(link)}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-3 py-3 text-sm font-medium transition hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}