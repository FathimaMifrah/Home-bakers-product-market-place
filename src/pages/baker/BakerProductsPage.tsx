/*
 File: src/pages/baker/BakerProductsPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: BakerProductsPage
 */

import type { Product, ProductCategory } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createProduct, updateProduct, deleteProduct } from '@/services/productService'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Search, ImageIcon, Package } from 'lucide-react'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { uploadImage } from '@/services/uploadService'
import { useAuth } from '@/contexts/AuthContext'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { useState } from 'react'


// emptyForm: Helper or component used in this file.
const emptyForm = {
  name: '', description: '', price: '', category: 'cakes' as ProductCategory,
  imageUrl: '', stock: '10', isAvailable: true,
}

// BakerProductsPage: React page component for a top-level route view.
export default function BakerProductsPage() {
  const { user } = useAuth()
  const { products, refreshProducts } = useMarketplace()
  const myProducts = products.filter((p) => p.bakerId === user?.id)
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const filtered = myProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description ?? '', price: String(p.price),
      category: p.category, imageUrl: p.imageUrl, stock: String(p.stock), isAvailable: p.isAvailable,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Please log in again as a baker')
      return
    }
    if (!form.name.trim() || !form.price) {
      toast.error('Name and price are required')
      return
    }
    const price = parseFloat(form.price)
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Enter a valid price')
      return
    }
    const stock = Math.max(0, parseInt(form.stock, 10) || 0)
    setSaving(true)
    try {
      const payload = {
        bakerId: user.id,
        name: form.name.trim(),
        description: form.description || '',
        price,
        category: form.category,
        imageUrl: form.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        stock,
        isAvailable: stock > 0,
      }
      if (editing) {
        await updateProduct(editing.id, payload)
        toast.success('Product updated successfully')
      } else {
        await createProduct(payload)
        toast.success('Product created successfully')
      }
      await refreshProducts()
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeletingId(id)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteProduct(deletingId)
      await refreshProducts()
      toast.success('Product deleted')
    } catch (err) {
      toast.error('Failed to delete product')
    }
    setDeleteOpen(false)
    setDeletingId(null)
  }

  return (
    <DashboardLayout role="baker">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">My Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{myProducts.length} products in your catalog</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="size-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{editing ? 'Edit' : 'New'} Product</DialogTitle>
              <DialogDescription>
                {editing ? 'Update your product details and photo.' : 'Add a new product to your bakery catalog.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Image Preview & Upload */}
              <div className="space-y-2">
                <Label>Product Photo</Label>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Preview" className="size-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' }} />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ImageIcon className="size-10" />
                      <span className="text-sm">No photo uploaded</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-medium">
                      Uploading...
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Or paste an image URL..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="flex-1" />
                  <div className="relative">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer w-24"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const url = await uploadImage(file)
                          setForm(prev => ({ ...prev, imageUrl: url }))
                          toast.success('Image uploaded')
                        } catch (err) {
                          toast.error('Failed to upload image')
                        } finally {
                          setUploading(false)
                          e.target.value = ''
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" className="w-24">Upload</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input placeholder="e.g. Red Velvet Cupcake" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe your product..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (Rs.) *</Label>
                  <Input type="number" min="0" placeholder="150" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" min="0" placeholder="50" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ProductCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No products yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Start by adding your first bakery product.</p>
            <Button onClick={openCreate}><Plus className="size-4 mr-1" /> Add Product</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <Card key={product.id} className="group overflow-hidden transition-all hover:shadow-soft-lg">
              <div className="relative aspect-video overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="icon" variant="secondary" className="size-8 rounded-full" onClick={() => openEdit(product)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button size="icon" variant="destructive" className="size-8 rounded-full" onClick={() => confirmDelete(product.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <Badge className="absolute top-2 left-2 text-[10px]" variant={product.isAvailable ? 'default' : 'destructive'}>
                  {product.isAvailable ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label}
                    </p>
                  </div>
                  <span className="text-primary font-bold shrink-0">{formatCurrency(product.price)}</span>
                </div>
                <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => openEdit(product)}>
                      <Pencil className="size-3" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="h-7 text-xs gap-1" onClick={() => confirmDelete(product.id)}>
                      <Trash2 className="size-3" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Yes, Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}