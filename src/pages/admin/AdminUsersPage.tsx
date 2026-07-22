/*
 File: src/pages/admin/AdminUsersPage.tsx
 Purpose: React page component that renders a full screen view.
 Main exports: AdminUsersPage
 */

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatDate } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { toggleUserActive } from '@/services/authService'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { Search } from 'lucide-react'


// AdminUsersPage: React page component for a top-level route view.
export default function AdminUsersPage() {
  const { users, refreshUsers } = useMarketplace()
  const [searchTerm, setSearchTerm] = useState('')

  const customers = users.filter((u) => u.role === 'customer')

  const filteredCustomers = customers.filter((user) => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.referenceId && user.referenceId.toLowerCase().includes(term))
    )
  })

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleUserActive(id)
      if (!updated) {
        toast.error('Failed to update user')
        return
      }
      await refreshUsers()
      toast.success('User status updated')
    } catch {
      toast.error('Failed to update user. Is the server running?')
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-serif text-2xl font-bold">Manage Users</h1>
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl h-10 bg-card border-border/40"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {user.referenceId ?? '-'}
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleToggle(user.id)}>
                        {user.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No matching users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}