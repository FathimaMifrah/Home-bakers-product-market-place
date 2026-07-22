/*
 File: src/pages/admin/AdminSalariesPage.tsx
 Purpose: React page component that allows Admins to manage and view salaries for Delivery Partners.
 */

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { 
  getSalaryPartners, 
  createSalary, 
  paySalary, 
  getSalaries, 
  type PartnerSalaryStats, 
  type SalaryRecord 
} from '@/services/salaryService'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, Search, Calendar, Filter, Users, ClipboardList, CheckCircle, Clock } from 'lucide-react'

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export default function AdminSalariesPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear())
  
  // Search & Filters for History
  const [historySearch, setHistorySearch] = useState('')
  const [historyMonth, setHistoryMonth] = useState<string>('all')
  const [historyYear, setHistoryYear] = useState<string>('all')
  const [historyStatus, setHistoryStatus] = useState<string>('all')

  const [partners, setPartners] = useState<PartnerSalaryStats[]>([])
  const [history, setHistory] = useState<SalaryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog State
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<PartnerSalaryStats | null>(null)
  const [baseSalary, setBaseSalary] = useState<number>(25000)
  const [bonus, setBonus] = useState<number>(0)
  const [deduction, setDeduction] = useState<number>(0)
  const [remarks, setRemarks] = useState('')

  const loadData = async () => {
    setIsLoading(true)
    try {
      const pData = await getSalaryPartners(selectedMonth, selectedYear)
      setPartners(pData)

      const filters: any = {}
      if (historyMonth !== 'all') filters.month = Number(historyMonth)
      if (historyYear !== 'all') filters.year = Number(historyYear)
      if (historyStatus !== 'all') filters.status = historyStatus
      if (historySearch.trim()) filters.search = historySearch

      const hData = await getSalaries(filters)
      setHistory(hData)
    } catch (err) {
      toast.error('Failed to load salary details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedMonth, selectedYear, historyMonth, historyYear, historyStatus])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const handleManageSalaryClick = (partner: PartnerSalaryStats) => {
    setSelectedPartner(partner)
    if (partner.salary) {
      setBaseSalary(partner.salary.baseSalary)
      setBonus(partner.salary.bonus)
      setDeduction(partner.salary.deduction)
      setRemarks(partner.salary.remarks || '')
    } else {
      setBaseSalary(25000)
      setBonus(0)
      setDeduction(0)
      setRemarks('')
    }
    setIsSalaryModalOpen(true)
  }

  const handleSaveSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPartner) return

    try {
      await createSalary({
        deliveryPartnerId: selectedPartner.id,
        month: selectedMonth,
        year: selectedYear,
        baseSalary,
        bonus,
        deduction,
        remarks: remarks || undefined
      })
      toast.success('Salary record saved successfully')
      setIsSalaryModalOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save salary record')
    }
  }

  const handleMarkAsPaid = async (salaryId: string) => {
    try {
      await paySalary(salaryId)
      toast.success('Salary payment recorded. Driver has been notified!')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to process payment')
    }
  }

  const finalSalary = baseSalary + bonus - deduction

  // Filter local state for instant responsiveness on search
  const filteredHistory = history.filter(h => {
    if (!historySearch.trim()) return true
    const q = historySearch.toLowerCase()
    return h.partnerName.toLowerCase().includes(q) || h.partnerEmail.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout role="admin">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Salary Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage, calculate, and record salaries for delivery partners</p>
        </div>
      </div>

      {/* Current Month Active Grid */}
      <Card className="rounded-3xl border-border/40 shadow-soft mb-8">
        <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-serif text-lg font-bold">Calculation Sheet</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Select a month and year to calculate driver base salary and bonuses</p>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-xl h-10 px-3 border border-input bg-card text-foreground focus:outline-none text-xs font-semibold"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index + 1}>{name}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-xl h-10 px-3 border border-input bg-card text-foreground focus:outline-none text-xs font-semibold"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver ID</TableHead>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Deliveries Completed</TableHead>
                  <TableHead>Salary Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length > 0 ? (
                  partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {partner.referenceId ?? '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <p className="font-semibold">{partner.name}</p>
                        <p className="text-xs text-muted-foreground">{partner.email}</p>
                      </TableCell>
                      <TableCell className="text-sm capitalize font-medium">
                        {partner.vehicleType}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {partner.totalDeliveriesCompleted}
                      </TableCell>
                      <TableCell>
                        {partner.salary ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant={partner.salary.paymentStatus === 'paid' ? 'default' : 'secondary'} className="w-fit text-[10px] uppercase font-bold tracking-wider">
                              {partner.salary.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                            </Badge>
                            <p className="text-xs font-bold text-foreground">{formatCurrency(partner.salary.finalSalary)}</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs border-dashed text-muted-foreground bg-transparent">Not Processed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl text-xs font-bold"
                            onClick={() => handleManageSalaryClick(partner)}
                            disabled={partner.salary?.paymentStatus === 'paid'}
                          >
                            {partner.salary ? 'Edit Salary' : 'Calculate'}
                          </Button>
                          {partner.salary && partner.salary.paymentStatus === 'pending' && (
                            <Button 
                              size="sm" 
                              className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
                              onClick={() => handleMarkAsPaid(partner.salary!.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No delivery partners registered in the system.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Salary History & Records */}
      <Card className="rounded-3xl border-border/40 shadow-soft">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="font-serif text-lg font-bold">Salary History Records</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Audit log of all past and pending driver salary disbursements</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by driver name..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-9 h-9 w-48 rounded-xl text-xs bg-card border-border/40"
                />
              </form>

              {/* Status Filter */}
              <select
                value={historyStatus}
                onChange={(e) => setHistoryStatus(e.target.value)}
                className="rounded-xl h-9 px-3 border border-input bg-card text-foreground focus:outline-none text-xs font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>

              {/* Month Filter */}
              <select
                value={historyMonth}
                onChange={(e) => setHistoryMonth(e.target.value)}
                className="rounded-xl h-9 px-3 border border-input bg-card text-foreground focus:outline-none text-xs font-semibold"
              >
                <option value="all">All Months</option>
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index + 1}>{name}</option>
                ))}
              </select>

              {/* Year Filter */}
              <select
                value={historyYear}
                onChange={(e) => setHistoryYear(e.target.value)}
                className="rounded-xl h-9 px-3 border border-input bg-card text-foreground focus:outline-none text-xs font-semibold"
              >
                <option value="all">All Years</option>
                {[2024, 2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salary ID</TableHead>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Deduction</TableHead>
                  <TableHead>Final Salary</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        #{rec.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        <p>{rec.partnerName}</p>
                        {rec.partnerReferenceId && (
                          <p className="font-mono text-xs text-muted-foreground font-normal">{rec.partnerReferenceId}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {MONTH_NAMES[rec.month - 1]} {rec.year}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(rec.baseSalary)}</TableCell>
                      <TableCell className="text-sm font-medium text-emerald-600">+{formatCurrency(rec.bonus)}</TableCell>
                      <TableCell className="text-sm font-medium text-rose-500">-{formatCurrency(rec.deduction)}</TableCell>
                      <TableCell className="text-sm font-bold text-foreground">{formatCurrency(rec.finalSalary)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rec.paymentDate ? formatDate(rec.paymentDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rec.paymentStatus === 'paid' ? 'default' : 'secondary'} className="capitalize text-xs font-semibold">
                          {rec.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {rec.paymentStatus === 'pending' && (
                          <Button 
                            size="sm" 
                            className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
                            onClick={() => handleMarkAsPaid(rec.id)}
                          >
                            Pay Now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No matching salary records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Manage Salary Dialog */}
      <Dialog open={isSalaryModalOpen} onOpenChange={setIsSalaryModalOpen}>
        <DialogContent className="rounded-3xl max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">Calculate Driver Salary</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Setup details for {selectedPartner?.name} for the period {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </p>
          </DialogHeader>
          <form onSubmit={handleSaveSalarySubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="base-salary">Base Salary (Rs.)</Label>
              <Input
                id="base-salary"
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                required
                className="rounded-xl h-10 border-border/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="salary-bonus">Bonus (Rs.)</Label>
                <Input
                  id="salary-bonus"
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(Number(e.target.value))}
                  className="rounded-xl h-10 border-border/40 text-emerald-500 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salary-deduction">Deduction (Rs.)</Label>
                <Input
                  id="salary-deduction"
                  type="number"
                  value={deduction}
                  onChange={(e) => setDeduction(Number(e.target.value))}
                  className="rounded-xl h-10 border-border/40 text-rose-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="salary-remarks">Remarks & Notes</Label>
              <Textarea
                id="salary-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Include details about performance, overtime, or reason for bonuses..."
                className="rounded-xl min-h-20 border-border/40"
              />
            </div>

            {/* Calculations Banner */}
            <div className="p-4 rounded-2xl bg-muted/50 border border-border/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimated Pay</p>
                <p className="text-sm text-muted-foreground mt-0.5">{baseSalary} + {bonus} - {deduction}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Final Salary</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(finalSalary)}</p>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-xl h-10 text-xs font-bold" onClick={() => setIsSalaryModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="rounded-xl h-10 text-xs font-bold">Save Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
