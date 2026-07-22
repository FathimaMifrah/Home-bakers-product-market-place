/*
 File: src/pages/auth/RegisterPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: RegisterPage
 */

import type { UserRole } from '@/types'
import { ArrowLeft, ArrowRight, Loader2, User, ChefHat, CheckCircle2, Mail, Lock, Phone, MapPin, Store, Tag, Eye, EyeOff, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { MeteorImpactBorder } from '@/components/ui/meteor-impact-border'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { validateEmail, validatePhone } from '@/lib/validation'


// SIDE_IMAGE: Helper or component used in this file.
const SIDE_IMAGE = '/artisan_baking.png'
// SIDE_IMAGE_FALLBACK: Helper or component used in this file.
const SIDE_IMAGE_FALLBACK = '/placeholder.jpg'

// containerVariants: Helper or component used in this file.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}
// itemVariants: Helper or component used in this file.
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}
// slideVariants: Helper or component used in this file.
const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.25 } },
}

// RegisterPage: Sends registration data to register a new user.
export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: '', bakeryName: '', specialties: '',
    vehicleType: 'bike', licenseNumber: '',
  })

  const isEmailValid = form.email === '' || validateEmail(form.email)
  const isPhoneValid = form.phone === '' || validatePhone(form.phone)

  const isFormValid = form.name.trim() !== '' &&
                      form.email.trim() !== '' &&
                      validateEmail(form.email) &&
                      (form.phone === '' || validatePhone(form.phone)) &&
                      form.password.length >= 6 &&
                      (role !== 'baker' || (form.bakeryName.trim() !== '' && form.specialties.trim() !== '')) &&
                      (role !== 'delivery_partner' || form.licenseNumber.trim() !== '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role || !isFormValid) return
    setIsLoading(true)
    setError('')
    
    const payload: any = {
      name: form.name,
      email: form.email,
      password: form.password,
      role,
      phone: form.phone || undefined,
      address: form.address || undefined,
    }
    
    if (role === 'baker') {
      payload.bakeryName = form.bakeryName
      payload.specialties = form.specialties.split(',').map((s) => s.trim())
    } else if (role === 'delivery_partner') {
      payload.vehicleType = form.vehicleType
      payload.licenseNumber = form.licenseNumber
    }

    const result = await register(payload)
    setIsLoading(false)
    if (result && result.ok) {
      const target = role === 'baker' ? '/baker' : role === 'delivery_partner' ? '/delivery' : '/customer'
      navigate(target)
    } else {
      setError(result?.error || 'Registration failed or email already registered.')
    }
  }

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (field === 'phone') {
      val = val.replace(/\D/g, '').slice(0, 10)
    }
    setForm({ ...form, [field]: val })
  }

  const inputBase = 'rounded-xl h-12 pl-11 pr-4 text-foreground placeholder:text-muted-foreground'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel — Branding Image */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src={SIDE_IMAGE}
          alt="Artisan baking"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement
            img.onerror = null
            img.src = SIDE_IMAGE_FALLBACK
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-semibold text-lg">
            <ChefHat className="size-7" />
            Home Bakers
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
            <h2 className="font-serif text-5xl font-bold text-white leading-tight">
              Start your<br />baking<br />journey today.
            </h2>
            <p className="mt-6 text-lg text-white/80 max-w-md leading-relaxed">
              Whether you love to bake or love to eat — there's a place for you in our community.
            </p>

            {/* Trust indicators */}
            <div className="mt-8 flex gap-8">
              {[
                { label: 'Bakers', value: '120+' },
                { label: 'Products', value: '800+' },
                { label: 'Deliveries', value: '5K+' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Registration Form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        <div className="absolute -top-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-accent/8 blur-[120px]" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />

        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-[440px] relative z-10">
          <motion.div variants={itemVariants}>
            <Link to="/" className="lg:hidden text-muted-foreground mb-8 inline-flex items-center gap-2 text-sm hover:text-primary transition-colors font-medium">
              <ArrowLeft className="size-4" /> Back to Home
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <ChefHat className="size-6 text-primary" />
              <span className="font-serif font-bold text-lg text-foreground">Home Bakers</span>
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground">Create account</h1>
            <p className="text-muted-foreground mt-2 text-base">Join the premium bakery marketplace</p>
          </motion.div>

          {/* Step indicator */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${step >= 1 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <span className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">1</span>
              Role
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${step >= 2 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <span className={`size-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-primary text-white' : 'bg-muted-foreground/30 text-muted-foreground'}`}>2</span>
              Details
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">I want to join as</p>

                {/* Customer Card */}
                <button
                  type="button"
                  onClick={() => { setRole('customer'); setStep(2) }}
                  className="group w-full relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-left transition-all duration-300 hover:border-primary/40 hover:shadow-soft"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-amber-200/20 to-orange-300/20 blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative flex items-center gap-5">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/80 to-orange-600/80 text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                      <User className="size-7" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-xl group-hover:text-primary transition-colors">Customer</p>
                      <p className="text-muted-foreground text-sm mt-1">Discover & order premium artisan treats from local bakers</p>
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </button>

                {/* Baker Card */}
                <button
                  type="button"
                  onClick={() => { setRole('baker'); setStep(2) }}
                  className="group w-full relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-left transition-all duration-300 hover:border-primary/40 hover:shadow-soft"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-rose-200/20 to-primary/20 blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative flex items-center gap-5">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-rose text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                      <ChefHat className="size-7" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-xl group-hover:text-primary transition-colors">Baker</p>
                      <p className="text-muted-foreground text-sm mt-1">Showcase your talent & sell homemade baked goods online</p>
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </button>

                {/* Delivery Partner Card */}
                <button
                  type="button"
                  onClick={() => { setRole('delivery_partner'); setStep(2) }}
                  className="group w-full relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-left transition-all duration-300 hover:border-primary/40 hover:shadow-soft"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-300/20 blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative flex items-center gap-5">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                      <Truck className="size-7" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-xl group-hover:text-primary transition-colors">Delivery Partner</p>
                      <p className="text-muted-foreground text-sm mt-1">Deliver fresh treats and earn money on your own schedule</p>
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </motion.div>
            ) : (
              <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit">
                {/* Selected role indicator */}
                <div className="flex items-center gap-3 mb-6 bg-primary/5 p-3.5 rounded-2xl border border-primary/10">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-primary capitalize">{role} Account</span>
                    <p className="text-[11px] text-muted-foreground">Step 2 of 2 — fill in your details</p>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors">Change</button>
                </div>

                <MeteorImpactBorder borderRadius="1.5rem" duration={6}>
                  <form autoComplete="off" onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border/30 bg-card/80 backdrop-blur-sm p-7">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                        <Input name="name" autoComplete="name" value={form.name} onChange={updateField('name')} placeholder="Your full name" required className={inputBase} />
                      </div>
                    </div>

                    {/* Email & Password side by side on wider screens */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                          <Input 
                            name="email" 
                            autoComplete="email" 
                            type="email" 
                            value={form.email} 
                            onChange={updateField('email')} 
                            placeholder="you@email.com" 
                            required 
                            className={`${inputBase} ${!isEmailValid && form.email !== '' ? 'border-destructive focus-visible:ring-destructive/30' : ''}`} 
                          />
                        </div>
                        {!isEmailValid && form.email !== '' && (
                          <p className="text-xs text-destructive mt-1 font-semibold">Please enter a valid email address.</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                          <Input name="password" autoComplete="new-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateField('password')} placeholder="••••••••" required className={inputBase} />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <Label className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Phone <span className="text-muted-foreground/40 normal-case">(optional)</span></Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                        <Input 
                          value={form.phone} 
                          onChange={updateField('phone')} 
                          placeholder="0712345678" 
                          className={`${inputBase} ${!isPhoneValid && form.phone !== '' ? 'border-destructive focus-visible:ring-destructive/30' : ''}`} 
                        />
                      </div>
                      {!isPhoneValid && form.phone !== '' && (
                        <p className="text-xs text-destructive mt-1 font-semibold">Phone number must contain exactly 10 digits.</p>
                      )}
                    </div>

                    {/* Customer-only: address */}
                    {role === 'customer' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1.5">
                        <Label className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Delivery Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                          <Input value={form.address} onChange={updateField('address')} placeholder="123 Main St, Colombo" className={inputBase} />
                        </div>
                      </motion.div>
                    )}

                    {/* Baker-only fields */}
                    {role === 'baker' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-1">
                        <div className="h-px bg-border/50" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary/60">Bakery Details</p>
                        <div className="space-y-1.5">
                          <Label className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Bakery Name</Label>
                          <div className="relative">
                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                            <Input value={form.bakeryName} onChange={updateField('bakeryName')} placeholder="Sweet Creations" required className={inputBase} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Specialties</Label>
                          <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                            <Input value={form.specialties} onChange={updateField('specialties')} placeholder="Cakes, Pastries, Bread" className={inputBase} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Delivery Partner-only fields */}
                    {role === 'delivery_partner' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-1">
                        <div className="h-px bg-border/50" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary/60">Delivery Details</p>
                        <div className="space-y-1.5">
                          <Label className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Vehicle Type</Label>
                          <select
                            value={form.vehicleType}
                            onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                            className="w-full rounded-xl h-12 px-4 border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="bike">Bicycle / Bike</option>
                            <option value="scooter">Scooter / Motorcycle</option>
                            <option value="car">Car / Van</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Driving License Number</Label>
                          <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                            <Input value={form.licenseNumber} onChange={updateField('licenseNumber')} placeholder="e.g. B1234567" required className={inputBase} />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-destructive text-sm font-medium bg-destructive/8 p-3 rounded-xl border border-destructive/15 text-center">
                        {error}
                      </motion.div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" className="h-12 rounded-xl px-5 bg-background/50 border-border/40" onClick={() => setStep(1)}>
                        <ArrowLeft className="size-4 mr-1" /> Back
                      </Button>
                      <Button type="submit" className="flex-1 h-12 rounded-xl text-sm font-bold tracking-wide uppercase shadow-soft hover:shadow-soft-lg transition-all" disabled={isLoading || !isFormValid}>
                        {isLoading ? <Loader2 className="size-5 animate-spin" /> : (
                          <span className="flex items-center gap-2">Create Account <ArrowRight className="size-4" /></span>
                        )}
                      </Button>
                    </div>
                  </form>
                </MeteorImpactBorder>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p variants={itemVariants} className="text-muted-foreground text-center text-sm mt-8">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary hover:underline font-semibold">Sign In</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}