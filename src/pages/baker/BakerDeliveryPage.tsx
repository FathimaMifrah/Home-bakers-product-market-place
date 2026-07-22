/*
 File: src/pages/baker/BakerDeliveryPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: BakerDeliveryPage
 */

import type { DeliverySettings } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getDeliverySettings, updateDeliverySettings } from '@/services/orderService'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'


// BakerDeliveryPage: React page component for a top-level route view.
export default function BakerDeliveryPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<DeliverySettings | null>(null)
  const [form, setForm] = useState({ minOrderValue: '', maxDeliveryKm: '', deliveryFeePerKm: '', baseDeliveryFee: '' })

  useEffect(() => {
    if (user) {
      getDeliverySettings(user.id).then((s) => {
        setSettings(s)
        setForm({
          minOrderValue: String(s.minOrderValue),
          maxDeliveryKm: String(s.maxDeliveryKm),
          deliveryFeePerKm: String(s.deliveryFeePerKm),
          baseDeliveryFee: String(s.baseDeliveryFee),
        })
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    await updateDeliverySettings(user.id, {
      minOrderValue: parseFloat(form.minOrderValue),
      maxDeliveryKm: parseFloat(form.maxDeliveryKm),
      deliveryFeePerKm: parseFloat(form.deliveryFeePerKm),
      baseDeliveryFee: parseFloat(form.baseDeliveryFee),
    })
    toast.success('Delivery settings saved')
  }

  return (
    <DashboardLayout role="baker">
      <h1 className="mb-6 font-serif text-2xl font-bold">Delivery Settings</h1>
      <Card className="max-w-lg">
        <CardHeader><CardTitle>Configure Delivery Rules</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Minimum Order Value (Rs.)</Label>
            <Input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Maximum Delivery Distance (km)</Label>
            <Input type="number" value={form.maxDeliveryKm} onChange={(e) => setForm({ ...form, maxDeliveryKm: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Base Delivery Fee (Rs.)</Label>
            <Input type="number" value={form.baseDeliveryFee} onChange={(e) => setForm({ ...form, baseDeliveryFee: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Fee Per km (Rs.)</Label>
            <Input type="number" value={form.deliveryFeePerKm} onChange={(e) => setForm({ ...form, deliveryFeePerKm: e.target.value })} />
          </div>
          <Button onClick={handleSave} className="w-full">Save Settings</Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}