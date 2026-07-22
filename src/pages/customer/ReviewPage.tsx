/*
 File: src/pages/customer/ReviewPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: ReviewPage
 */

import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createReview, getReviewByOrder } from '@/services/reviewService'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getOrderById } from '@/services/orderService'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'


// ReviewPage: React page component for a top-level route view.
export default function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      getOrderById(id).then((o) => {
        if (o?.status !== 'delivered') navigate(`/customer/orders/${id}`)
        else setOrder(o)
      })
      getReviewByOrder(id!).then((r) => {
        if (r) navigate(`/customer/orders/${id}`)
      })
    }
  }, [id, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order || !user) return
    setIsSubmitting(true)
    try {
      await createReview({
        orderId: order.id,
        productId: order.items[0].productId,
        customerId: user.id,
        customerName: user.name,
        rating,
        comment,
      })
      toast.success('Review submitted!')
      navigate(`/customer/orders/${order.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!order) {
    return (
      <DashboardLayout role="customer">
        <p className="text-muted-foreground">Loading...</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer">
      <h1 className="mb-6 font-serif text-2xl font-bold">Leave a Review</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{order.bakerName}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)}>
                    <Star className={`size-8 ${n <= rating ? 'fill-accent text-accent' : 'text-muted'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows={4} />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}