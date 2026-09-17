/*
 File: src/pages/delivery/DeliveryProfilePage.tsx
 Purpose: React page component that renders and manages a delivery partner's profile and settings.
 */

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateDeliveryPartnerProfile } from '@/services/deliveryService'
import { toast } from 'sonner'
import { validatePhone } from '@/lib/validation'
import { 
  User,
  Phone, 
  Mail, 
  Truck, 
  Shield, 
  Star, 
  CheckCircle,
  MapPin
} from 'lucide-react'

export default function DeliveryProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    vehicleType: user?.vehicleType || 'bike',
    licenseNumber: user?.licenseNumber || ''
  })

  const isPhoneValid = form.phone === '' || validatePhone(form.phone)
  const isFormValid = form.name.trim() !== '' && isPhoneValid && form.licenseNumber.trim() !== ''

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isFormValid) return
    setIsSubmitting(true)
    try {
      const updatedUser = await updateDeliveryPartnerProfile(user.id, form)
      if (updatedUser) {
        // Sync context state
        user.name = updatedUser.name
        user.phone = updatedUser.phone
        user.address = updatedUser.address
        user.vehicleType = updatedUser.vehicleType
        user.licenseNumber = updatedUser.licenseNumber
        
        setIsEditing(false)
        toast.success('Profile updated successfully')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Active status color helper
  const getVehicleLabel = (type?: string) => {
    switch (type) {
      case 'bike':
        return 'Bicycle / Bike'
      case 'scooter':
        return 'Scooter / Motorcycle'
      case 'car':
        return 'Car / Van'
      default:
        return 'Not Specified'
    }
  }

  return (
    <DashboardLayout role="delivery_partner">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your delivery partner credentials and statistics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Stats & Summary Card */}
        <Card className="md:col-span-1 rounded-3xl border-border/40 shadow-soft overflow-hidden h-fit">
          {/* Cover Header */}
          <div className="h-28 bg-gradient-to-br from-primary via-primary/80 to-indigo-600 flex items-end justify-center pb-4 relative">
            <div className="absolute top-3 right-3 text-[10px] bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white font-bold uppercase tracking-wider border border-white/10">
              {user?.role.replace('_', ' ')}
            </div>
          </div>
          
          <CardContent className="pt-12 relative flex flex-col items-center text-center">
            {/* Avatar placeholder */}
            <div className="size-20 rounded-full border-4 border-background bg-muted flex items-center justify-center absolute -top-10 shadow-md">
              <User className="size-10 text-muted-foreground/60" />
            </div>

            <h2 className="font-serif text-xl font-bold text-foreground mt-2">{user?.name}</h2>
            <p className="text-xs text-muted-foreground">{user?.email}</p>

            <div className="grid grid-cols-2 gap-4 w-full border-t border-b border-border/40 py-4 my-6">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" /> Rating
                </span>
                <p className="text-lg font-bold text-foreground mt-1">{user?.rating || '5.00'}/5</p>
              </div>
              <div className="text-center border-l">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="size-3.5 text-emerald-500" /> Deliveries
                </span>
                <p className="text-lg font-bold text-foreground mt-1">{user?.totalDeliveriesCompleted || 0}</p>
              </div>
            </div>

            <div className="w-full text-left space-y-3.5 text-sm">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Truck className="size-4 shrink-0" />
                <span className="text-foreground font-medium">{getVehicleLabel(user?.vehicleType)}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Shield className="size-4 shrink-0" />
                <span className="font-mono text-xs font-semibold text-foreground">License: {user?.licenseNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span className="text-foreground">{user?.phone || 'No phone number'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Profile Detail Edit Form */}
        <Card className="md:col-span-2 rounded-3xl border-border/40 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl font-bold">Personal Credentials</CardTitle>
            {!isEditing && (
              <Button size="sm" className="rounded-full text-xs font-semibold" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      disabled={!isEditing} 
                      required 
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      value={form.email} 
                      disabled={true} // Email should not be modifiable
                      className="pl-10 rounded-xl bg-muted/30"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      value={form.phone} 
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setForm({ ...form, phone: cleaned })
                      }} 
                      disabled={!isEditing} 
                      placeholder="0712345678"
                      className={`pl-10 rounded-xl ${!isPhoneValid && form.phone !== '' ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                    />
                  </div>
                  {!isPhoneValid && form.phone !== '' && (
                    <p className="text-xs text-destructive mt-1 font-semibold">Phone number must contain exactly 10 digits.</p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="address">Base Address / Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input 
                      id="address" 
                      value={form.address} 
                      onChange={(e) => setForm({ ...form, address: e.target.value })} 
                      disabled={!isEditing} 
                      placeholder="e.g. Colombo Central"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Vehicle Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <select
                    id="vehicleType"
                    value={form.vehicleType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({
                      ...form,
                      vehicleType: e.target.value as 'bike' | 'scooter' | 'car',
                    })}
                    disabled={!isEditing}
                    className="w-full rounded-xl h-11 px-4 border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted/30 disabled:text-muted-foreground"
                  >
                    <option value="bike">Bicycle / Bike</option>
                    <option value="scooter">Scooter / Motorcycle</option>
                    <option value="car">Car / Van</option>
                  </select>
                </div>

                {/* License Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="licenseNumber">Driving License Number</Label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input 
                      id="licenseNumber" 
                      value={form.licenseNumber} 
                      onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} 
                      disabled={!isEditing} 
                      required 
                      className="pl-10 font-mono text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 justify-end pt-4 border-t border-border/40">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="rounded-xl h-10 text-xs font-bold" 
                    onClick={() => {
                      setIsEditing(false)
                      // Reset values
                      setForm({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        address: user?.address || '',
                        vehicleType: user?.vehicleType || 'bike',
                        licenseNumber: user?.licenseNumber || ''
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="rounded-xl h-10 text-xs font-bold"
                    disabled={isSubmitting || !isFormValid}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
