/*
 File: src/components/home/FeaturedBakes.tsx
 Purpose: Reusable React UI component.
 Main exports: FeaturedBakes, FeaturedBakesHeader
 */

import type { Product, User } from '@/types'
import { ArrowRight } from 'lucide-react'
import { filterProducts } from '@/services/productService'
import { Link } from 'react-router-dom'
import { ProductCard } from '@/components/products/ProductCard'


interface FeaturedBakesProps {
  products: Product[]
  users: User[]
  search: string
  showAddButton: boolean
  onAddToCart: (product: Product) => void
}

// getBakerName: Fetches data or reads values for the application.
function getBakerName(users: User[], bakerId: string) {
  const baker = users.find((u) => u.id === bakerId)
  return baker?.bakeryName ?? baker?.name ?? 'Unknown Baker'
}

// FeaturedBakes: Helper or component used in this file.
export function FeaturedBakes({ products, users, search, showAddButton, onAddToCart }: FeaturedBakesProps) {
  const filtered = filterProducts(products, { search, availableOnly: false })
  const featured = filtered[0]
  const compact = filtered.slice(1, 3)
  const horizontal = filtered[3]

  if (filtered.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center">No products found matching your search.</p>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:grid-rows-2">
      {featured && (
        <div className="lg:row-span-2">
          <ProductCard
            product={featured}
            bakerName={getBakerName(users, featured.bakerId)}
            variant="featured"
            showAddButton={showAddButton}
            onAddToCart={onAddToCart}
          />
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:col-start-2">
        {compact.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="compact"
            showAddButton={showAddButton}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
      {horizontal && (
        <div className="lg:col-start-2">
          <ProductCard
            product={horizontal}
            variant="horizontal"
            showAddButton={showAddButton}
            onAddToCart={onAddToCart}
          />
        </div>
      )}
      {filtered.length > 4 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
          {filtered.slice(4, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              bakerName={getBakerName(users, product.bakerId)}
              showAddButton={showAddButton}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// FeaturedBakesHeader: Helper or component used in this file.
export function FeaturedBakesHeader() {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-serif text-3xl font-bold md:text-4xl">Featured Bakes</h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Handpicked artisanal treats available right now.
        </p>
      </div>
      <Link
        to="/products"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm font-medium transition-colors"
      >
        View all bakes <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}