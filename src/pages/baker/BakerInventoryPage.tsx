/*
 File: src/pages/baker/BakerInventoryPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: BakerInventoryPage
 */

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'
import { LOW_STOCK_THRESHOLD } from '@/lib/constants'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { updateStock } from '@/services/productService'
import { useAuth } from '@/contexts/AuthContext'
import { useMarketplace } from '@/contexts/MarketplaceContext'


// BakerInventoryPage: React page component for a top-level route view.
export default function BakerInventoryPage() {
  const { user } = useAuth()
  const { products, refreshProducts } = useMarketplace()
  const myProducts = products.filter((p) => p.bakerId === user?.id)

  const adjustStock = async (id: string, change: number) => {
    await updateStock(id, change)
    await refreshProducts()
    toast.success('Stock updated')
  }

  return (
    <DashboardLayout role="baker">
      <h1 className="mb-6 font-serif text-2xl font-bold">Inventory Management</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <span className={product.stock <= LOW_STOCK_THRESHOLD ? 'text-destructive font-medium' : ''}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isAvailable ? 'default' : 'destructive'}>
                      {product.isAvailable ? 'Available' : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => adjustStock(product.id, -1)}>-</Button>
                      <Button variant="outline" size="sm" onClick={() => adjustStock(product.id, 1)}>+</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}