/*
 File: src/pages/auth/LoginPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: LoginPage
 */

import type { UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, ChefHat, User, Shield, ArrowLeft, Loader2, Sparkles, Lock, Mail, Truck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { MeteorImpactBorder } from '@/components/ui/meteor-impact-border'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'


// SIDE_IMAGE: Helper or component used in this file.
const SIDE_IMAGE = '/artisan_baking.png'

// roles: Helper or component used in this file.
const roles = [
  { id: 'customer' as UserRole, title: 'Customer', description: 'Browse treats', icon: User, gradient: 'from-amber-500/80 to-orange-600/80' },
  { id: 'baker' as UserRole, title: 'Baker', description: 'Sell creations', icon: ChefHat, gradient: 'from-primary to-rose' },
  { id: 'delivery_partner' as UserRole, title: 'Delivery', description: 'Deliver treats', icon: Truck, gradient: 'from-blue-500 to-indigo-600' },
  { id: 'admin' as UserRole, title: 'Admin', description: 'Manage platform', icon: Shield, gradient: 'from-slate-600 to-slate-800' },
]

// containerVariants: Helper or component used in this file.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}
// itemVariants: Helper or component used in this file.
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

// LoginPage: Sends login credentials to the authentication API.
export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    setIsLoading(true)
    setError('')
    const result = await login(email.trim(), password, selectedRole)
    setIsLoading(false)
    if (result.ok) {
      const paths: Record<UserRole, string> = { customer: '/customer', baker: '/baker', admin: '/admin', delivery_partner: '/delivery' }
      navigate(paths[selectedRole])
    } else {
      setError(result.error ?? 'Invalid email/password, wrong role selected, or baker not approved yet.')
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel — Branding Image */}
      <div className="relative hidden w-1/2 lg:block">
        <img src={SIDE_IMAGE} alt="Fresh baked goods" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Floating branding content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-semibold text-lg">
            <ChefHat className="size-7" />
            Home Bakers
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
            <h2 className="font-serif text-5xl font-bold text-white leading-tight">
              Freshly baked<br />with love,<br />just for you.
            </h2>
            <p className="mt-6 text-lg text-white/80 max-w-md leading-relaxed">
              Handcrafted pastries, warm bread loaves, and traditional Sri Lankan sweets — all from your neighborhood home bakers.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="size-10 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm" />
                ))}
              </div>
              <div className="text-white/90">
                <p className="font-semibold text-sm">2,500+ happy customers</p>
                <p className="text-xs text-white/60">Join our growing community</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute -top-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full bg-accent/8 blur-[120px]" />

        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-[440px] relative z-10">
          {/* Mobile back link */}
          <motion.div variants={itemVariants}>
            <Link to="/" className="lg:hidden text-muted-foreground mb-8 inline-flex items-center gap-2 text-sm hover:text-primary transition-colors font-medium">
              <ArrowLeft className="size-4" /> Back to Home
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <ChefHat className="size-6 text-primary" />
              <span className="font-serif font-bold text-lg text-foreground">Home Bakers</span>
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-base">Sign in to continue to your account</p>
          </motion.div>

          {/* Role Selector */}
          <motion.div variants={itemVariants} className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Select your role</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {roles.map((role) => {
                const isActive = selectedRole === role.id
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 ${
                      isActive
                        ? 'border-primary/60 bg-primary/5 shadow-sm scale-[1.02]'
                        : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                    }`}
                  >
                    <div className={`flex size-11 items-center justify-center rounded-xl transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-br ${role.gradient} text-white shadow-md`
                        : 'bg-secondary/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      <role.icon className="size-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold transition-colors ${isActive ? 'text-primary' : 'text-foreground'}`}>{role.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">{role.description}</p>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="loginRole"
                        className="absolute -inset-px rounded-2xl border-2 border-primary/60"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Login Form */}
          <AnimatePresence>
            {selectedRole && (
              <motion.div
                initial={{ opacity: 0, y: 12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              >
                <MeteorImpactBorder borderRadius="1.5rem" duration={5} className="mb-6">
                  <form autoComplete="off" onSubmit={handleLogin} className="space-y-5 rounded-3xl border border-border/30 bg-card/80 backdrop-blur-sm p-7">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                        <Input
                          id="email"
                          name="email"
                          autoComplete="username"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="hello@example.com"
                          required
                          className="rounded-xl h-12 pl-11 pr-4 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-foreground/70 text-xs font-semibold uppercase tracking-wider">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                        <Input
                          id="password"
                          name="password"
                          autoComplete="current-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="rounded-xl h-12 pl-11 pr-12 text-foreground placeholder:text-muted-foreground"
                        />
                        <button
                          type="button"
                          className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-destructive text-sm font-medium bg-destructive/8 p-3 rounded-xl border border-destructive/15">
                        <Sparkles className="size-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl text-sm font-bold tracking-wide uppercase shadow-soft hover:shadow-soft-lg transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="size-5 animate-spin" /> : (
                        <span className="flex items-center gap-2">Sign In <ArrowLeft className="-rotate-180 size-4" /></span>
                      )}
                    </Button>
                  </form>
                </MeteorImpactBorder>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p variants={itemVariants} className="text-muted-foreground text-center text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="text-primary hover:underline font-semibold">Create one</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}