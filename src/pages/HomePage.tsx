/*
 File: src/pages/HomePage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: HomePage
 */

import type { Product, Review } from '@/types'
import { Button } from '@/components/ui/button'
import { Flame, ChefHat, Star, ArrowRight, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAllReviews } from '@/services/reviewService'


// HERO_IMAGE: Helper or component used in this file.
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&h=900&fit=crop&q=80'

// fadeUp: Helper or component used in this file.
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
}

// staggerContainer: Helper or component used in this file.
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

const DEFAULT_REVIEWS = [
  {
    id: 'r1',
    customerName: 'Alice Silva',
    rating: 5,
    comment: 'The caramel pudding was absolutely heavenly! Super soft and melted in my mouth. Will definitely order again!',
    productName: 'Caramel pudding'
  },
  {
    id: 'r2',
    customerName: 'Nipuni Fernando',
    rating: 5,
    comment: 'Delicious chocolate chip cookies. They arrived warm and fresh from the kitchen. Highly recommended!',
    productName: 'Chocolate Chip Cookies'
  },
  {
    id: 'r3',
    customerName: 'Roshan Perera',
    rating: 4,
    comment: 'The custom birthday cake was beautifully decorated and tasted amazing. Great service and communication.',
    productName: 'Custom Birthday Cake'
  }
]

// HomePage: React page component for a top-level route view.
export default function HomePage() {
  const { products, users } = useMarketplace()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const bakers = users.filter((u) => u.role === 'baker' && u.isApproved)

  const [reviews, setReviews] = useState<any[]>([])
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)

  useEffect(() => {
    getAllReviews().then((r) => {
      const activeReviews = r.filter((rev) => rev.comment && rev.comment.trim() !== '')
      setReviews(activeReviews.length > 0 ? activeReviews : DEFAULT_REVIEWS)
    }).catch(() => {
      setReviews(DEFAULT_REVIEWS)
    })
  }, [])

  // Auto-play reviews slideshow
  useEffect(() => {
    if (reviews.length <= 1) return
    const interval = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [reviews])

  const handleAdd = (product: Product) => {
    addItem({
      productId: product.id,
      bakerId: product.bakerId,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    })
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Bakery hero"
            className="size-full object-cover opacity-90"
            style={{ filter: 'brightness(1.05) contrast(1.03)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background/95" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-4 py-16 md:px-6 lg:px-8">
          <div className="grid w-full gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
              <motion.span variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm">
                <Flame className="size-4" />
                Handcrafted by local home bakers
              </motion.span>
              <motion.div variants={fadeUp} className="mt-8">
                <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
                  Freshly Baked, Just for You!
                </h1>
              </motion.div>
              <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Explore artisan breads, sweet pastries, and custom cakes made with love and delivered warm from local kitchens directly to your doorstep.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <Button size="lg" className="shadow-soft hover:shadow-soft-lg transition-all" asChild>
                  <Link to={user?.role === 'customer' ? '/customer/browse' : '/products'}>
                    Order Now <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-background/50 backdrop-blur-sm transition-all" asChild>
                  <Link to="/auth/register">Become a Baker</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-3xl border border-border/50 bg-card p-3 shadow-soft glass-surface">
                <img src={products[0]?.imageUrl} alt={products[0]?.name} className="h-80 w-full rounded-2xl object-cover transition-transform hover:scale-105 duration-700" />
              </div>
              <div className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-border/50 bg-card p-3 shadow-sm glass-surface">
                  <img src={products[1]?.imageUrl} alt={products[1]?.name} className="h-36 w-full rounded-2xl object-cover transition-transform hover:scale-105 duration-700" />
                </div>
                <div className="overflow-hidden rounded-3xl border border-border/50 bg-card p-3 shadow-sm glass-surface">
                  <img src={products[2]?.imageUrl} alt={products[2]?.name} className="h-36 w-full rounded-2xl object-cover transition-transform hover:scale-105 duration-700" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold mb-3">Why Choose Us?</p>
            <h2 className="font-serif text-4xl font-bold text-foreground md:text-5xl">Delicious bakery favorites<br/>made fresh every day</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid gap-8 lg:grid-cols-3">
            {[
              {
                title: 'Artisan Breads',
                description: 'Hand-shaped loaves with crisp crusts and soft, fragrant centers, baked with time-honored techniques.',
                icon: <ChefHat className="size-6 text-primary" />,
              },
              {
                title: 'Sweet Pastries',
                description: 'Buttery croissants, delicate danishes, and seasonal treats baked fresh every morning.',
                icon: <Star className="size-6 text-primary" />,
              },
              {
                title: 'Custom Cakes',
                description: 'Beautifully designed cakes tailored for your special celebrations and unforgettable moments.',
                icon: <Flame className="size-6 text-primary" />,
              },
            ].map((item) => (
              <motion.article variants={fadeUp} key={item.title} className="rounded-3xl border border-border/40 bg-card p-10 shadow-soft transition-all hover:-translate-y-2 hover:shadow-soft-lg group">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  {item.icon}
                </div>
                <h3 className="mt-8 font-serif text-2xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{item.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-xl rounded-3xl border border-border/50 bg-secondary/20 p-12 shadow-soft">
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold mb-3">Visit Us Today</p>
              <h2 className="mt-6 font-serif text-4xl font-bold text-foreground leading-tight">Discover fresh flavors and a warm community.</h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Place your order and enjoy locally-made bakery items with fast home delivery or easy pickup. Support your neighborhood bakers today.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button size="lg" className="shadow-soft hover:shadow-md" asChild>
                  <Link to="/products">Visit Our Store</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid gap-4 sm:grid-cols-2">
              {products.slice(0, 4).map((product) => (
                <motion.div variants={fadeUp} key={product.id} className="overflow-hidden rounded-3xl border border-border/40 bg-card p-2 shadow-sm">
                  <img src={product.imageUrl} alt={product.name} className="h-56 w-full rounded-2xl object-cover hover:scale-105 transition-transform duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Slideshow Section */}
      <section className="py-20 bg-secondary/15 overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12">
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold mb-3">Testimonials</p>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">What Our Customers Say</h2>
          </motion.div>

          {reviews.length > 0 && (
            <div className="relative rounded-3xl border border-border/40 bg-card p-8 md:p-12 shadow-soft min-h-[250px] flex flex-col justify-center items-center">
              <Quote className="size-10 text-primary/10 absolute top-6 left-6" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeReviewIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-5 ${
                          i < reviews[activeReviewIndex].rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-lg md:text-xl font-medium italic text-foreground leading-relaxed max-w-2xl">
                    "{reviews[activeReviewIndex].comment}"
                  </p>

                  <div>
                    <h4 className="font-serif text-base font-bold text-foreground">
                      {reviews[activeReviewIndex].customerName}
                    </h4>
                    {reviews[activeReviewIndex].productName && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Verified Purchase of <span className="font-semibold text-primary">{reviews[activeReviewIndex].productName}</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="flex gap-4 mt-8">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full size-10 bg-background/50 border-border/40 hover:bg-primary/10"
                  onClick={() =>
                    setActiveReviewIndex((prev) =>
                      prev === 0 ? reviews.length - 1 : prev - 1
                    )
                  }
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full size-10 bg-background/50 border-border/40 hover:bg-primary/10"
                  onClick={() =>
                    setActiveReviewIndex((prev) => (prev + 1) % reviews.length)
                  }
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)]" />
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="relative z-10 mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="font-serif text-4xl font-bold md:text-5xl text-primary-foreground">Ready to taste the difference?</h2>
          <p className="mx-auto mt-6 text-lg text-primary-foreground/90 leading-relaxed">
            Join thousands of happy customers and talented bakers on Sri Lanka&apos;s favorite premium home bakery marketplace.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold" asChild>
              <Link to="/auth/register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/products">Catalog</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}