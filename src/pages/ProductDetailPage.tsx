/*
 File: src/pages/ProductDetailPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: ProductDetailPage
 */

import type { Product, Review } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/lib/utils'
import { getProductById } from '@/services/productService'
import { getReviewsByProduct } from '@/services/reviewService'
import { Navbar } from '@/components/layout/Navbar'
import { ProductCard } from '@/components/products/ProductCard'
import { Star, ShoppingCart, Truck, ShieldCheck, ChevronRight, Minus, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useEffect, useState } from 'react'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { useParams, Link, useNavigate } from 'react-router-dom'


// ProductDetailPage: React page component for a top-level route view.
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { products, users } = useMarketplace()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (id) {
      getProductById(id).then(setProduct)
      getReviewsByProduct(id).then(setReviews)
    }
  }, [id])

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const baker = users.find((u) => u.id === product.bakerId)
  const soldCount = product.reviewCount * 3 + Math.floor(product.rating * 10)
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 5)

  const handleAddToCart = () => {
    if (user?.role !== 'customer') {
      toast.info('Please login as a customer to add items to cart')
      navigate('/auth/login')
      return
    }
    addItem({
      productId: product.id,
      bakerId: product.bakerId,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    }, quantity)
    toast.success('Added to cart!')
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/customer/cart')
  }

  return (
    <div className="min-h-screen bg-muted/80">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        {/* Breadcrumb */}
        <nav className="text-muted-foreground mb-4 flex flex-wrap items-center gap-1 text-xs">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/products" className="hover:text-primary">Products</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* Left - Image gallery */}
          <div className="rounded-3xl border bg-card p-4 shadow-soft">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="aspect-square w-full rounded-2xl object-cover"
            />
          </div>

          {/* Right - Buy box (AliExpress style) */}
          <div className="space-y-4">
            <div className="sticky top-24 rounded-3xl border bg-card p-6 shadow-soft">
              <h1 className="text-lg font-medium leading-snug md:text-xl">{product.name}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{product.rating}</span>
                </span>
                <span className="text-muted-foreground">{product.reviewCount} reviews</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{soldCount}+ sold</span>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-3xl font-bold text-[#ff4747]">{formatCurrency(product.price)}</p>
                <p className="text-muted-foreground mt-1 text-xs line-through">
                  {formatCurrency(Math.round(product.price * 1.2))}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="size-4" />
                  <span>Delivery fee is calculated at checkout based on your location</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="size-4" />
                  <span>Freshness guaranteed by {baker?.bakeryName ?? baker?.name}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Quantity</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-none"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={!product.isAvailable}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {product.isAvailable ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-[#ff4747] text-[#ff4747] hover:bg-[#ff4747]/5"
                  disabled={!product.isAvailable}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="size-4" />
                  Add to Cart
                </Button>
                <Button
                  className="h-11 rounded-sm bg-[#ff4747] hover:bg-[#e53935]"
                  disabled={!product.isAvailable}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>

              {!product.isAvailable && (
                <Badge variant="destructive" className="mt-3 w-full justify-center py-1">
                  Currently Out of Stock
                </Badge>
              )}
            </div>

            {/* Baker info card */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-muted-foreground text-xs">Sold by</p>
              <p className="font-semibold">{baker?.bakeryName ?? baker?.name}</p>
              {baker?.specialties && (
                <p className="text-muted-foreground mt-1 text-xs">{baker.specialties.join(' · ')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs - description & reviews */}
        <div className="mt-8 rounded-3xl border bg-card p-5 shadow-soft">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <Badge variant="outline" className="mt-3 capitalize">{product.category}</Badge>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4 space-y-4">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`size-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.customerName}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{review.comment}</p>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 font-serif text-xl font-bold">More to Love</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  variant="marketplace"
                  showAddButton={user?.role === 'customer'}
                  onAddToCart={(prod) => {
                    addItem({
                      productId: prod.id,
                      bakerId: prod.bakerId,
                      name: prod.name,
                      price: prod.price,
                      imageUrl: prod.imageUrl,
                    })
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}