import { useState } from 'react'
import { approveBaker, rejectBaker } from '@/services/authService'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { formatDate } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { useMarketplace } from '@/contexts/MarketplaceContext'
import { Search } from 'lucide-react'


// AdminBakersPage: React page component for a top-level route view.
export default function AdminBakersPage() {
  const { users, refreshUsers } = useMarketplace()
  const [searchTerm, setSearchTerm] = useState('')

  const bakers = users.filter((u) => u.role === 'baker')

  const filteredBakers = bakers.filter((baker) => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true
    return (
      baker.name.toLowerCase().includes(term) ||
      (baker.bakeryName && baker.bakeryName.toLowerCase().includes(term)) ||
      baker.email.toLowerCase().includes(term) ||
      (baker.referenceId && baker.referenceId.toLowerCase().includes(term))
    )
  })

  const handleApprove = async (id: string) => {
    try {
      const updated = await approveBaker(id)
      if (!updated) {
        toast.error('Failed to approve baker')
        return
      }
      await refreshUsers()
      toast.success('Baker approved')
    } catch {
      toast.error('Failed to approve baker')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const updated = await rejectBaker(id)
      if (!updated) {
        toast.error('Failed to reject baker')
        return
      }
      await refreshUsers()
      toast.success('Baker rejected')
    } catch {
      toast.error('Failed to reject baker')
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-serif text-2xl font-bold">Manage Bakers</h1>
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or bakery..."
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
                <TableHead>Baker ID</TableHead>
                <TableHead>Bakery</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBakers.length > 0 ? (
                filteredBakers.map((baker) => (
                  <TableRow key={baker.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {baker.referenceId ?? '-'}
                    </TableCell>
                    <TableCell className="font-medium">{baker.bakeryName}</TableCell>
                    <TableCell>{baker.name}</TableCell>
                    <TableCell>{baker.specialties?.join(', ') ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant={baker.isApproved ? 'default' : 'outline'}>
                        {baker.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(baker.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!baker.isApproved && (
                          <Button size="sm" onClick={() => handleApprove(baker.id)}>Approve</Button>
                        )}
                        {baker.isApproved && (
                          <Button size="sm" variant="destructive" onClick={() => handleReject(baker.id)}>Reject</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No matching bakers found.
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