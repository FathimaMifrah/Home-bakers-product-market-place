/*
 File: src/pages/admin/AdminDeliveryPage.tsx
 Purpose: React page component that renders the admin console for managing delivery partners and assignments.
 */

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  getDeliveryPartners, 
  getDeliveryAssignments, 
  getDeliveryStats, 
  createDeliveryPartner, 
  assignDeliveryPartner,
  updateDeliveryAssignmentStatus,
  type DeliveryStats 
} from '@/services/deliveryService'
import { updateUser } from '@/services/authService'
import { validateEmail, validatePhone } from '@/lib/validation'
import type { DeliveryAssignment, User } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Truck, 
  User as UserIcon, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Shield, 
  Star,
  Users,
  TrendingUp,
  FileText
} from 'lucide-react'

export default function AdminDeliveryPage() {
  const [partners, setPartners] = useState<User[]>([])
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([])
  const [stats, setStats] = useState<DeliveryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('partners')

  // Search & Filter
  const [partnerSearch, setPartnerSearch] = useState('')
  const [assignmentSearch, setAssignmentSearch] = useState('')

  // Modals state
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false)
  const [isEditPartnerOpen, setIsEditPartnerOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<DeliveryAssignment | null>(null)

  // Add Partner Form State
  const [addForm, setAddForm] = useState({
    name: '', email: '', password: '', phone: '', address: '', vehicleType: 'bike', licenseNumber: ''
  })
  
  // Edit Partner Form State
  const [editForm, setEditForm] = useState({
    name: '', phone: '', address: '', vehicleType: 'bike', licenseNumber: '', availabilityStatus: 'offline'
  })

  // Manual Assignment selection
  const [assignPartnerId, setAssignPartnerId] = useState('')

  // Validation for Add Partner Form
  const isAddEmailValid = addForm.email === '' || validateEmail(addForm.email)
  const isAddPhoneValid = addForm.phone === '' || validatePhone(addForm.phone)
  const isAddFormValid = addForm.name.trim() !== '' &&
                         addForm.email.trim() !== '' &&
                         validateEmail(addForm.email) &&
                         (addForm.phone === '' || validatePhone(addForm.phone)) &&
                         addForm.password.length >= 6 &&
                         addForm.licenseNumber.trim() !== ''

  // Validation for Edit Partner Form
  const isEditPhoneValid = editForm.phone === '' || validatePhone(editForm.phone)
  const isEditFormValid = editForm.name.trim() !== '' &&
                          (editForm.phone === '' || validatePhone(editForm.phone)) &&
                          editForm.licenseNumber.trim() !== ''

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [p, a, s] = await Promise.all([
        getDeliveryPartners(),
        getDeliveryAssignments(),
        getDeliveryStats()
      ])
      setPartners(p)
      setAssignments(a)
      setStats(s)
    } catch (err) {
      toast.error('Failed to load delivery module data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddPartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAddFormValid) return
    try {
      await createDeliveryPartner(addForm)
      toast.success('Delivery partner registered successfully')
      setIsAddPartnerOpen(false)
      setAddForm({ name: '', email: '', password: '', phone: '', address: '', vehicleType: 'bike', licenseNumber: '' })
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to register delivery partner')
    }
  }

  const handleEditPartnerClick = (partner: User) => {
    setSelectedPartner(partner)
    setEditForm({
      name: partner.name,
      phone: partner.phone || '',
      address: partner.address || '',
      vehicleType: partner.vehicleType || 'bike',
      licenseNumber: partner.licenseNumber || '',
      availabilityStatus: partner.availabilityStatus || 'offline'
    })
    setIsEditPartnerOpen(true)
  }

  const handleEditPartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPartner || !isEditFormValid) return
    try {
      // We reuse backend PATCH/PUT routes
      await updateUser(selectedPartner.id, editForm)
      toast.success('Delivery partner profile updated')
      setIsEditPartnerOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update partner')
    }
  }

  const handleTogglePartnerActive = async (partner: User) => {
    try {
      const updated = await updateUser(partner.id, { isActive: !partner.isActive })
      if (updated) {
        toast.success(`Partner account ${updated.isActive ? 'activated' : 'deactivated'}`)
        loadData()
      }
    } catch (err) {
      toast.error('Failed to update account status')
    }
  }

  const handleAssignClick = (assignment: DeliveryAssignment) => {
    setSelectedAssignment(assignment)
    setAssignPartnerId('')
    setIsAssignOpen(true)
  }

  const handleManualAssignSubmit = async () => {
    if (!selectedAssignment || !assignPartnerId) {
      toast.error('Please select a delivery partner')
      return
    }
    try {
      const res = await assignDeliveryPartner(selectedAssignment.order_id, assignPartnerId)
      if (res.success) {
        toast.success('Delivery partner assigned successfully')
        setIsAssignOpen(false)
        loadData()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign partner')
    }
  }

  const handleGenerateReport = () => {
    // Generate simple printable report
    window.print()
  }

  const filteredPartners = partners.filter(
    (p) =>
      p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      (p.referenceId && p.referenceId.toLowerCase().includes(partnerSearch.toLowerCase()))
  )

  const filteredAssignments = assignments.filter(
    (a) =>
      a.order_id.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      (a.customerName && a.customerName.toLowerCase().includes(assignmentSearch.toLowerCase())) ||
      (a.partnerName && a.partnerName.toLowerCase().includes(assignmentSearch.toLowerCase()))
  )

  const getVehicleLabel = (type?: string) => {
    switch (type) {
      case 'bike': return 'Bike'
      case 'scooter': return 'Scooter'
      case 'car': return 'Car'
      default: return 'N/A'
    }
  }

  const getAssignmentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_assignment':
        return <Badge className="bg-rose-50 text-rose-700 border border-rose-200">Pending Assignment</Badge>
      case 'assigned':
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Assigned</Badge>
      case 'picked_up':
        return <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">Picked Up</Badge>
      case 'out_for_delivery':
        return <Badge className="bg-purple-50 text-purple-700 border border-purple-200">Out for Delivery</Badge>
      case 'delivered':
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</Badge>
      case 'failed':
        return <Badge variant="destructive" className="bg-rose-100 text-rose-800 border border-rose-200">Failed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Delivery Partner Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage delivery partners, manual assignments, and review tracking metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl h-11 text-xs font-bold" onClick={handleGenerateReport}>
            <FileText className="size-4 mr-1.5" /> Generate Report
          </Button>
          <Button className="rounded-xl h-11 text-xs font-bold" onClick={() => setIsAddPartnerOpen(true)}>
            <Plus className="size-4 mr-1.5" /> Add Partner
          </Button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-8">
        <h1 className="font-serif text-3xl font-bold">HomeBakers Marketplace - Delivery Performance Report</h1>
        <p className="text-sm text-muted-foreground mt-2">Generated on: {new Date().toLocaleString()}</p>
        <hr className="my-4 border-t-2 border-foreground" />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card className="rounded-3xl border-border/40 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Partners</CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.partners.total || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Active: {partners.filter(p => p.isActive).length} | Inactive: {partners.filter(p => !p.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Online / Available</CardTitle>
            <Activity className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats?.partners.available || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Currently ready for matching</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Assign</CardTitle>
            <AlertCircle className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{stats?.deliveries.pending || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Orders waiting for drivers</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Earnings</CardTitle>
            <TrendingUp className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats?.todayEarnings || 0)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Delivery fees collected today</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivered / Success</CardTitle>
            <CheckCircle className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats?.deliveries.completed || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Failed: {stats?.deliveries.failed || 0} | Success rate: {stats && stats.deliveries.total > 0 ? Math.round((stats.deliveries.completed / stats.deliveries.total) * 100) : 100}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="print:block">
        <TabsList className="mb-6 rounded-2xl p-1 bg-muted/60 border border-border/10 print:hidden">
          <TabsTrigger value="partners" className="rounded-xl text-xs font-semibold px-4">Delivery Partners</TabsTrigger>
          <TabsTrigger value="assignments" className="rounded-xl text-xs font-semibold px-4">Assignments & History</TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners">
          <Card className="rounded-3xl border-border/40 shadow-soft">
            <CardHeader className="pb-3 print:hidden">
              <div className="relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners by name or email..."
                  value={partnerSearch}
                  onChange={(e) => setPartnerSearch(e.target.value)}
                  className="pl-10 rounded-xl h-10 bg-card border-border/40"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner ID</TableHead>
                      <TableHead>Partner Name</TableHead>
                      <TableHead>Contact Information</TableHead>
                      <TableHead>Vehicle & License</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead className="text-right print:hidden">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-mono text-xs font-semibold">
                          {partner.referenceId ?? '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                              <UserIcon className="size-4 text-muted-foreground" />
                            </div>
                            <span className="font-semibold text-sm">{partner.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <p>{partner.email}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{partner.phone || 'No phone'}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          <p className="font-medium">{getVehicleLabel(partner.vehicleType)}</p>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">{partner.licenseNumber || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-bold flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" /> {partner.rating || '5.00'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">({partner.totalDeliveriesCompleted || 0} completed)</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize font-semibold text-xs border-0 py-0.5 px-2.5 rounded-full ${
                            partner.availabilityStatus === 'available' ? 'bg-emerald-50 text-emerald-700' :
                            partner.availabilityStatus === 'busy' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-700'
                          }`}>
                            {partner.availabilityStatus || 'offline'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-semibold text-xs border-0 py-0.5 px-2.5 rounded-full ${
                            partner.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {partner.isActive ? 'Active' : 'Deactivated'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right print:hidden">
                          <div className="flex justify-end gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-xl text-xs font-semibold"
                              onClick={() => handleEditPartnerClick(partner)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`rounded-xl text-xs font-semibold ${partner.isActive ? 'text-destructive hover:text-destructive' : 'text-emerald-600 hover:text-emerald-600'}`}
                              onClick={() => handleTogglePartnerActive(partner)}
                            >
                              {partner.isActive ? 'Deactivate' : 'Reactivate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <Card className="rounded-3xl border-border/40 shadow-soft">
            <CardHeader className="pb-3 print:hidden">
              <div className="relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments by Order, Customer, or Driver..."
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  className="pl-10 rounded-xl h-10 bg-card border-border/40"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Route Details</TableHead>
                      <TableHead>Assigned Driver</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right print:hidden">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-mono text-xs font-semibold">
                          #{assignment.order_id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-sm">
                          <p className="font-semibold">{assignment.customerName} &larr; {assignment.bakerName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{assignment.deliveryAddress}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {assignment.delivery_partner_id ? (
                            <div>
                              <p className="font-semibold">{assignment.partnerName}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{assignment.partnerPhone}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-rose-500 font-bold bg-rose-500/5 px-2 py-1 rounded-md border border-rose-500/10">No Driver Assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className="capitalize text-xs rounded-md">
                            {assignment.assignedBy}
                          </Badge>
                        </TableCell>
                        <TableCell>{getAssignmentStatusBadge(assignment.status)}</TableCell>
                        <TableCell className="text-right print:hidden">
                          {assignment.status === 'pending_assignment' ? (
                            <Button 
                              size="sm" 
                              className="rounded-xl text-xs font-bold bg-primary text-white shadow-soft"
                              onClick={() => handleAssignClick(assignment)}
                            >
                              Assign Driver
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground font-medium">Locked</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Partner Dialog */}
      <Dialog open={isAddPartnerOpen} onOpenChange={setIsAddPartnerOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">Register Delivery Partner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPartnerSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Full Name</Label>
              <Input id="add-name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-email">Email</Label>
                <Input 
                  id="add-email" 
                  type="email" 
                  value={addForm.email} 
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} 
                  required 
                  className={`rounded-xl ${!isAddEmailValid && addForm.email !== '' ? 'border-destructive focus-visible:ring-destructive/30' : ''}`} 
                />
                {!isAddEmailValid && addForm.email !== '' && (
                  <p className="text-[10px] text-destructive font-semibold">Please enter a valid email address.</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-password">Password</Label>
                <Input id="add-password" type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} required className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-phone">Phone Number</Label>
                <Input 
                  id="add-phone" 
                  value={addForm.phone} 
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setAddForm({ ...addForm, phone: cleaned })
                  }} 
                  required 
                  className={`rounded-xl ${!isAddPhoneValid && addForm.phone !== '' ? 'border-destructive focus-visible:ring-destructive/30' : ''}`} 
                />
                {!isAddPhoneValid && addForm.phone !== '' && (
                  <p className="text-[10px] text-destructive font-semibold">Phone number must contain exactly 10 digits.</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-address">Base Area / Address</Label>
                <Input id="add-address" value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} placeholder="Colombo, Kandy etc." className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-vehicle">Vehicle Type</Label>
                <select
                  id="add-vehicle"
                  value={addForm.vehicleType}
                  onChange={(e) => setAddForm({ ...addForm, vehicleType: e.target.value })}
                  className="w-full rounded-xl h-11 px-4 border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="bike">Bicycle / Bike</option>
                  <option value="scooter">Scooter / Motorcycle</option>
                  <option value="car">Car / Van</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-license">License Number</Label>
                <Input id="add-license" value={addForm.licenseNumber} onChange={(e) => setAddForm({ ...addForm, licenseNumber: e.target.value })} required className="rounded-xl font-mono text-xs" />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-xl h-10 text-xs font-bold" onClick={() => setIsAddPartnerOpen(false)}>Cancel</Button>
              <Button type="submit" className="rounded-xl h-10 text-xs font-bold" disabled={!isAddFormValid}>Register Partner</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Partner Dialog */}
      <Dialog open={isEditPartnerOpen} onOpenChange={setIsEditPartnerOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">Edit Delivery Partner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPartnerSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input 
                  id="edit-phone" 
                  value={editForm.phone} 
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setEditForm({ ...editForm, phone: cleaned })
                  }} 
                  required 
                  className={`rounded-xl ${!isEditPhoneValid && editForm.phone !== '' ? 'border-destructive focus-visible:ring-destructive/30' : ''}`} 
                />
                {!isEditPhoneValid && editForm.phone !== '' && (
                  <p className="text-[10px] text-destructive font-semibold">Phone number must contain exactly 10 digits.</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-address">Base Area / Address</Label>
                <Input id="edit-address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-vehicle">Vehicle Type</Label>
                <select
                  id="edit-vehicle"
                  value={editForm.vehicleType}
                  onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                  className="w-full rounded-xl h-11 px-4 border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="bike">Bicycle / Bike</option>
                  <option value="scooter">Scooter / Motorcycle</option>
                  <option value="car">Car / Van</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-license">License Number</Label>
                <Input id="edit-license" value={editForm.licenseNumber} onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })} required className="rounded-xl font-mono text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-status">Availability Status</Label>
              <select
                id="edit-status"
                value={editForm.availabilityStatus}
                onChange={(e) => setEditForm({ ...editForm, availabilityStatus: e.target.value })}
                className="w-full rounded-xl h-11 px-4 border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-xl h-10 text-xs font-bold" onClick={() => setIsEditPartnerOpen(false)}>Cancel</Button>
              <Button type="submit" className="rounded-xl h-10 text-xs font-bold" disabled={!isEditFormValid}>Save Updates</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manual Assignment Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">Assign Delivery Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select an available delivery partner to manually assign to Order #{selectedAssignment?.order_id.slice(-6).toUpperCase()}.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="driver-select">Available Drivers</Label>
              <select
                id="driver-select"
                value={assignPartnerId}
                onChange={(e) => setAssignPartnerId(e.target.value)}
                className="w-full rounded-xl h-11 px-4 border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select a driver...</option>
                {partners
                  .filter((p) => p.isActive && p.availabilityStatus === 'available')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {getVehicleLabel(p.vehicleType)} (★ {p.rating || '5.00'})
                    </option>
                  ))}
              </select>
              {partners.filter((p) => p.isActive && p.availabilityStatus === 'available').length === 0 && (
                <p className="text-[10px] text-rose-500 font-medium">
                  ⚠️ No drivers are currently online and available. Drivers must change status to 'Available' in their dashboards.
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl h-10 text-xs font-bold" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button 
              className="rounded-xl h-10 text-xs font-bold" 
              onClick={handleManualAssignSubmit}
              disabled={!assignPartnerId}
            >
              Assign Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
