/*
 File: src/pages/customer/BrowsePage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: BrowsePage
 */

import type { Product, ProductCategory } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { filterProducts } from '@/services/productService'
import { Input } from '@/components/ui/input'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { ProductCard } from '@/components/products/ProductCard'
import { Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useEffect, useState } from 'react'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { useSearchParams } from 'react-router-dom'


// BrowsePage: React page component for a top-level route view.
export default function BrowsePage() {
  const [searchParams] = useSearchParams()
  const { products, users } = useMarketplace()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [category, setCategory] = useState<string>(searchParams.get('category') ?? 'all')
  const [sortBy, setSortBy] = useState<string>('rating')
  const [availableOnly, setAvailableOnly] = useState(true)

  useEffect(() => {
    const q = searchParams.get('search')
    if (q) setSearch(q)
  }, [searchParams])

  const filtered = filterProducts(products, {
    search,
    category: category as ProductCategory | 'all',
    availableOnly,
    sortBy: sortBy as 'price-asc' | 'price-desc' | 'rating' | 'name',
  })

  const getBakerName = (bakerId: string) => {
    const baker = users.find((u) => u.id === bakerId)
    return baker?.bakeryName ?? baker?.name ?? ''
  }

  const handleAdd = (product: Product) => {
    addItem({ productId: product.id, bakerId: product.bakerId, name: product.name, price: product.price, imageUrl: product.imageUrl })
    toast.success('Added to cart!')
  }

  return (
    <DashboardLayout role="customer">
      <h1 className="mb-2 font-serif text-3xl font-bold">Catalog</h1>
      <p className="text-muted-foreground mb-6">Discover artisan treats from local home bakers</p>
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input placeholder="Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PRODUCT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
          Available only
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
      {filtered.length === 0 && (
        <p className="text-muted-foreground py-12 text-center">No products found matching your filters.</p>
      )}
    </DashboardLayout>
  )
}