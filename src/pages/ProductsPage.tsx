/*
 File: src/pages/ProductsPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: ProductsPage
 */

import type { Product, ProductCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { filterProducts } from '@/services/productService'
import { Footer } from '@/components/layout/Footer'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/layout/Navbar'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { ProductCard } from '@/components/products/ProductCard'
import { Search, SlidersHorizontal, Grid3X3 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useEffect, useState } from 'react'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { useSearchParams } from 'react-router-dom'


// CategorySidebar: Helper or component used in this file.
function CategorySidebar({
  products,
  category,
  availableOnly,
  onCategoryChange,
  onAvailableChange,
}: {
  products: Product[]
  category: string
  availableOnly: boolean
  onCategoryChange: (cat: string) => void
  onAvailableChange: (val: boolean) => void
}) {
  return (
    <aside className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Categories</h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onCategoryChange('all')}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                category === 'all' && 'bg-primary/10 text-primary font-medium',
              )}
            >
              All Products ({products.length})
            </button>
          </li>
          {PRODUCT_CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat.value).length
            return (
              <li key={cat.value}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(cat.value)}
                  className={cn(
                    'w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                    category === cat.value && 'bg-primary/10 text-primary font-medium',
                  )}
                >
                  {cat.label} ({count})
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Availability</h3>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => onAvailableChange(e.target.checked)}
            className="rounded"
          />
          In stock only
        </label>
      </div>
    </aside>
  )
}

// ProductsPage: React page component for a top-level route view.
export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, users } = useMarketplace()
  const { user } = useAuth()
  const { addItem } = useCart()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') ?? 'rating')
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available') !== 'false')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '')
    setCategory(searchParams.get('category') ?? 'all')
    setSortBy(searchParams.get('sort') ?? 'rating')
    setAvailableOnly(searchParams.get('available') !== 'false')
  }, [searchParams])

  const filtered = filterProducts(products, {
    search: searchParams.get('search') ?? search,
    category: (searchParams.get('category') ?? category) as ProductCategory | 'all',
    availableOnly: searchParams.get('available') !== 'false' && availableOnly,
    sortBy: (searchParams.get('sort') ?? sortBy) as 'price-asc' | 'price-desc' | 'rating' | 'name',
  })

  const getBakerName = (bakerId: string) => {
    const baker = users.find((u) => u.id === bakerId)
    return baker?.bakeryName ?? baker?.name ?? ''
  }

  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v && v !== 'all') params.set(k, v)
      else params.delete(k)
    })
    setSearchParams(params)
  }

  const handleAdd = (product: Product) => {
    if (user?.role !== 'customer') return
    addItem({
      productId: product.id,
      bakerId: product.bakerId,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    })
  }

  return (
    <div className="min-h-screen bg-muted/80">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-4">
          <p className="text-muted-foreground text-xs">Home &gt; All Products</p>
          <h1 className="font-serif text-2xl font-bold md:text-3xl">Shop All Bakes</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} products found</p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-3xl border bg-card p-4 shadow-soft">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>

          <div className="relative min-w-45 flex-1 md:max-w-xs">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search in store..."
              className="h-9 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
            />
          </div>

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); applyFilters({ sort: v }) }}>
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Best Match</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name">Newest</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={() => applyFilters({ search })}>Search</Button>

          <div className="ml-auto hidden items-center gap-1 text-muted-foreground sm:flex">
            <Grid3X3 className="size-4" />
            <span className="text-xs">Grid view</span>
          </div>
        </div>

        <div className="flex gap-6">
          <div className={cn('hidden w-56 shrink-0 lg:block', sidebarOpen && 'block! w-full lg:w-56!')}>
            <div className="sticky top-24 rounded-3xl border bg-card p-5 shadow-soft">
              <CategorySidebar
                products={products}
                category={category}
                availableOnly={availableOnly}
                onCategoryChange={(cat) => { setCategory(cat); applyFilters({ category: cat }) }}
                onAvailableChange={(val) => { setAvailableOnly(val); applyFilters({ available: val ? 'true' : 'false' }) }}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {filtered.length === 0 ? (
              <div className="rounded-3xl border bg-card p-10 text-center shadow-soft">
                <p className="text-muted-foreground">No products match your filters.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchParams({})}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    bakerName={getBakerName(product.bakerId)}
                    variant="marketplace"
                    showAddButton={user?.role === 'customer'}
                    onAddToCart={handleAdd}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}