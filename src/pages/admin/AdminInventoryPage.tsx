/*
 File: src/pages/admin/AdminInventoryPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: AdminInventoryPage
 */

import type { Product, ProductCategory } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LOW_STOCK_THRESHOLD, PRODUCT_CATEGORIES } from '@/lib/constants'
import { Pencil, Trash2, Search, ImageIcon, AlertTriangle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { updateProduct, deleteProduct, updateStock } from '@/services/productService'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { useState } from 'react'


// AdminInventoryPage: React page component for a top-level route view.
export default function AdminInventoryPage() {
  const { products, refreshProducts, users } = useMarketplace()
  const [search, setSearch] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'cakes' as ProductCategory,
    imageUrl: '', stock: '0', isAvailable: true,
  })

  // Search filtering
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    users.find(u => u.id === p.bakerId)?.name.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockProducts = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD)

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setForm({
      name: p.name, description: p.description ?? '', price: String(p.price),
      category: p.category, imageUrl: p.imageUrl, stock: String(p.stock), isAvailable: p.isAvailable,
    })
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingProduct) return
    const price = parseFloat(form.price)
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Enter a valid price')
      return
    }
    const stock = Math.max(0, parseInt(form.stock, 10) || 0)
    setSaving(true)
    try {
      await updateProduct(editingProduct.id, {
        name: form.name.trim(),
        description: form.description,
        price,
        category: form.category,
        imageUrl: form.imageUrl,
        stock,
        isAvailable: form.isAvailable,
      })
      toast.success('Product updated successfully')
      await refreshProducts()
      setEditOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const adjustStock = async (id: string, change: number) => {
    try {
      await updateStock(id, change)
      await refreshProducts()
      toast.success('Stock updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update stock')
    }
  }

  const toggleAvailability = async (p: Product) => {
    try {
      await updateProduct(p.id, { isAvailable: !p.isAvailable })
      await refreshProducts()
      toast.success(p.isAvailable ? 'Marked as out of stock' : 'Marked as available')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update availability')
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
    <DashboardLayout role="admin">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Centralized Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage stock and edit products across all bakers</p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-500/5">
          <CardHeader className="py-4 pb-2">
            <CardTitle className="text-amber-600 flex items-center gap-2 text-base">
              <AlertTriangle className="size-5" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {lowStockProducts.length} product(s) are running low on stock (≤ {LOW_STOCK_THRESHOLD}).
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map(p => (
                <Badge key={p.id} variant="outline" className="bg-background border-amber-200 text-amber-700">
                  {p.name} ({p.stock} left)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search by product or baker name..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / Baker</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const baker = users.find(u => u.id === product.bakerId)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="size-10 rounded-md object-cover border" />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                            <ImageIcon className="size-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{baker?.bakeryName || baker?.name || 'Unknown Baker'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={product.stock <= LOW_STOCK_THRESHOLD ? 'text-destructive font-bold' : 'font-medium'}>
                          {product.stock}
                        </span>
                        <div className="flex flex-col">
                          <Button variant="ghost" size="icon" className="size-4 hover:bg-transparent" onClick={() => adjustStock(product.id, 1)}>+</Button>
                          <Button variant="ghost" size="icon" className="size-4 hover:bg-transparent" onClick={() => adjustStock(product.id, -1)}>-</Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.isAvailable ? 'default' : 'destructive'}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => toggleAvailability(product)}
                      >
                        {product.isAvailable ? 'Available' : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                          <Pencil className="size-3.5 mr-1.5" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => confirmDelete(product.id)}>
                          <Trash2 className="size-3.5 mr-1.5" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No products found in inventory.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Product Details</DialogTitle>
            <DialogDescription>
              Update product information. Notice: Admin cannot change the assigned Baker here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (Rs.) *</Label>
                <Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
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
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <Button onClick={handleSaveEdit} className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Yes, Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}