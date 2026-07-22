/*
 File: src/components/products/ProductCard.tsx
 Purpose: Reusable React UI component.
 Main exports: ProductCard
 */

import type { Product } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { Star, ShoppingCart, Truck } from 'lucide-react'


interface ProductCardProps {
  product: Product
  bakerName?: string
  onAddToCart?: (product: Product) => void
  showAddButton?: boolean
  variant?: 'default' | 'featured' | 'compact' | 'horizontal' | 'marketplace'
  categoryLabel?: string
}

// BakerAvatar: Helper or component used in this file.
function BakerAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
      {initials}
    </div>
  )
}

// ProductCard: Business logic helper or component for products/orders/reviews.
export function ProductCard({
  product,
  bakerName,
  onAddToCart,
  showAddButton,
  variant = 'default',
  categoryLabel,
}: ProductCardProps) {
  const catLabel =
    categoryLabel ??
    PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label ??
    product.category

  const soldCount = product.reviewCount * 3 + Math.floor(product.rating * 10)

  if (variant === 'marketplace') {
    return (
      <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg">
        <Link to={`/products/${product.id}`} className="relative block overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {!product.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Badge variant="destructive" className="rounded-sm">Sold Out</Badge>
            </div>
          )}
          {product.isAvailable && product.stock <= 5 && (
            <Badge className="absolute top-2 left-2 rounded-sm border-0 bg-[#ff4747] text-white text-[10px]">
              Low Stock
            </Badge>
          )}
          {showAddButton && onAddToCart && product.isAvailable && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-linear-to-t from-black/70 to-transparent p-3 transition-transform group-hover:translate-y-0">
              <Button
                size="sm"
                className="w-full rounded-sm bg-[#ff4747] text-white hover:bg-[#e53935]"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onAddToCart(product)
                }}
              >
                <ShoppingCart className="size-4" />
                Add to Cart
              </Button>
            </div>
          )}
        </Link>

        <div className="flex flex-1 flex-col p-3">
          <Link to={`/products/${product.id}`}>
            <h3 className="line-clamp-2 min-h-10 text-sm leading-snug text-foreground hover:text-[#ff4747]">
              {product.name}
            </h3>
          </Link>

          <p className="mt-2 text-xl font-bold text-[#ff4747]">{formatCurrency(product.price)}</p>

          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {product.rating}
            </span>
            <span>|</span>
            <span>{soldCount}+ sold</span>
          </div>

          {bakerName && (
            <p className="text-muted-foreground mt-1 truncate text-[11px]">{bakerName}</p>
          )}

          <div className="mt-auto flex items-center gap-1 pt-2 text-[11px] text-muted-foreground">
            <Truck className="size-3" />
            <span>Delivery fee calculated at checkout</span>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'featured') {
    return (
      <article className="group shadow-soft-lg overflow-hidden rounded-2xl bg-card">
        <Link to={`/products/${product.id}`} className="relative block">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="aspect-4/5 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="rounded-full border-0 bg-white/95 text-foreground shadow-sm">
              {catLabel}
            </Badge>
            <Badge className="bg-rose text-rose-foreground rounded-full border-0">
              <Star className="mr-1 size-3 fill-current" />
              {product.rating}
            </Badge>
          </div>
        </Link>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <Link to={`/products/${product.id}`}>
              <h3 className="font-serif text-xl font-bold leading-tight hover:text-primary">{product.name}</h3>
            </Link>
            <span className="bg-muted shrink-0 rounded-full px-3 py-1 text-sm font-semibold">
              {formatCurrency(product.price)}
            </span>
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm">{product.description}</p>
          {bakerName && (
            <div className="flex items-center gap-2 border-t pt-3">
              <BakerAvatar name={bakerName} />
              <p className="text-muted-foreground text-xs">
                By <span className="text-foreground font-medium">{bakerName}</span>
              </p>
            </div>
          )}
        </div>
      </article>
    )
  }

  if (variant === 'compact') {
    return (
      <article className="group shadow-soft flex flex-col overflow-hidden rounded-2xl bg-card">
        <Link to={`/products/${product.id}`} className="relative block">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="flex flex-1 flex-col p-4">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-serif text-base font-bold leading-snug hover:text-primary">{product.name}</h3>
          </Link>
          <p className="text-muted-foreground mt-1 line-clamp-2 flex-1 text-xs">{product.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
            {showAddButton && onAddToCart && product.isAvailable && (
              <Button size="icon" variant="soft" className="size-9" onClick={(e) => { e.stopPropagation(); e.preventDefault?.(); onAddToCart(product) }}>
                <ShoppingCart className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'horizontal') {
    return (
      <article className="group shadow-soft flex overflow-hidden rounded-2xl bg-card">
        <Link to={`/products/${product.id}`} className="relative w-2/5 shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="size-full min-h-[140px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="flex flex-1 flex-col justify-center p-4 md:p-5">
          <Badge className="bg-rose/70 text-rose-foreground mb-2 w-fit rounded-full border-0 text-[10px]">
            {product.category === 'seasonal' ? 'Seasonal' : catLabel}
          </Badge>
          <Link to={`/products/${product.id}`}>
            <h3 className="font-serif text-lg font-bold hover:text-primary">{product.name}</h3>
          </Link>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{product.description}</p>
          <p className="mt-2 text-base font-bold">{formatCurrency(product.price)}</p>
        </div>
      </article>
    )
  }

  return (
    <article className="group shadow-soft overflow-hidden rounded-2xl bg-card transition-shadow hover:shadow-soft-lg">
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!product.isAvailable && (
            <Badge variant="destructive" className="absolute top-3 right-3 rounded-full">
              Out of Stock
            </Badge>
          )}
        </div>
      </Link>
      <div className="space-y-2 p-4">
        {bakerName && <p className="text-muted-foreground text-xs">{bakerName}</p>}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-serif font-bold hover:text-primary">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Star className="size-3.5 fill-rose text-rose" />
          <span>{product.rating}</span>
          <span className="text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold">{formatCurrency(product.price)}</span>
          {showAddButton && onAddToCart && product.isAvailable && (
            <Button size="sm" variant="soft" onClick={(e) => { e.stopPropagation(); e.preventDefault?.(); onAddToCart(product) }}>
              <ShoppingCart className="size-4" />
              Add
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}