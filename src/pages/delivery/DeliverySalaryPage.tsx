/*
 File: src/pages/delivery/DeliverySalaryPage.tsx
 Purpose: React page component that renders a Delivery Partner's salary details, history, and receipts.
 */

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { getPartnerSalaries, type SalaryRecord } from '@/services/salaryService'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, Printer, Download, Calendar, ClipboardList, TrendingUp } from 'lucide-react'

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export default function DeliverySalaryPage() {
  const { user } = useAuth()
  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [currentMonthSalary, setCurrentMonthSalary] = useState<SalaryRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<SalaryRecord | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  const fetchSalaries = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await getPartnerSalaries(user.id)
      setSalaries(data)

      // Find current month salary (or latest one)
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      
      const current = data.find(s => s.month === currentMonth && s.year === currentYear)
      if (current) {
        setCurrentMonthSalary(current)
      } else if (data.length > 0) {
        setCurrentMonthSalary(data[0]) // default to latest calculated salary
      }
    } catch {
      toast.error('Failed to load salary history')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSalaries()
  }, [user])

  const handlePrintReceipt = () => {
    window.print()
  }

  const openReceipt = (record: SalaryRecord) => {
    setSelectedReceipt(record)
    setIsReceiptOpen(true)
  }

  return (
    <DashboardLayout role="delivery_partner">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">My Salary Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Track monthly payouts, bonuses, deductions, and payment slips</p>
      </div>

      {/* Top Section - Current/Latest Payout Summary Card */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="md:col-span-2 rounded-3xl border-border/40 shadow-soft overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent blur-xl" />
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-lg font-bold">Latest Payout Statement</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentMonthSalary 
                    ? `For ${MONTH_NAMES[currentMonthSalary.month - 1]} ${currentMonthSalary.year}` 
                    : 'No statements found'}
                </p>
              </div>
              {currentMonthSalary && (
                <Badge variant={currentMonthSalary.paymentStatus === 'paid' ? 'default' : 'secondary'} className="uppercase font-bold tracking-wider text-[10px] px-2.5 py-1">
                  {currentMonthSalary.paymentStatus}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {currentMonthSalary ? (
              <div className="space-y-6">
                {/* Breakdown Grid */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/40 rounded-2xl border border-border/10">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Base Salary</p>
                    <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(currentMonthSalary.baseSalary)}</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-2xl border border-border/10">
                    <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Bonus / Incentives</p>
                    <p className="text-lg font-bold text-emerald-600 mt-1">+{formatCurrency(currentMonthSalary.bonus)}</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-2xl border border-border/10">
                    <p className="text-xs text-rose-500 font-medium uppercase tracking-wider">Deductions</p>
                    <p className="text-lg font-bold text-rose-500 mt-1">-{formatCurrency(currentMonthSalary.deduction)}</p>
                  </div>
                </div>

                {/* Final payout banner */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Final Salary Amount</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Base + Bonus - Deductions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(currentMonthSalary.finalSalary)}</p>
                    {currentMonthSalary.paymentDate && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">Paid on {formatDate(currentMonthSalary.paymentDate)}</p>
                    )}
                  </div>
                </div>

                {currentMonthSalary.remarks && (
                  <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl border">
                    <strong>Note:</strong> {currentMonthSalary.remarks}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl text-xs font-bold gap-1.5"
                    onClick={() => openReceipt(currentMonthSalary)}
                  >
                    <ClipboardList className="size-3.5" /> View Payout Slip
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="size-10 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm font-semibold">Your salary hasn't been calculated for this month yet.</p>
                <p className="text-xs mt-1">Please contact your administrator for details.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Small stats card */}
        <Card className="rounded-3xl border-border/40 shadow-soft overflow-hidden h-fit flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-sm font-semibold text-muted-foreground uppercase tracking-wider">Earnings Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Paid Out (Overall)</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {formatCurrency(salaries.filter(s => s.paymentStatus === 'paid').reduce((sum, current) => sum + current.finalSalary, 0))}
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">Calculated Months</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{salaries.length} months</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary History Table */}
      <Card className="rounded-3xl border-border/40 shadow-soft">
        <CardHeader className="border-b pb-4">
          <CardTitle className="font-serif text-lg font-bold">Salary Payout History</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Archive log of your monthly compensation disbursements</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Disbursed Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.length > 0 ? (
                  salaries.map((sal) => (
                    <TableRow key={sal.id}>
                      <TableCell className="text-sm font-semibold">
                        {MONTH_NAMES[sal.month - 1]} {sal.year}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(sal.baseSalary)}</TableCell>
                      <TableCell className="text-sm font-medium text-emerald-600">+{formatCurrency(sal.bonus)}</TableCell>
                      <TableCell className="text-sm font-medium text-rose-500">-{formatCurrency(sal.deduction)}</TableCell>
                      <TableCell className="text-sm font-bold text-foreground">{formatCurrency(sal.finalSalary)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sal.paymentDate ? formatDate(sal.paymentDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sal.paymentStatus === 'paid' ? 'default' : 'secondary'} className="capitalize text-xs font-semibold">
                          {sal.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl text-xs font-bold"
                          onClick={() => openReceipt(sal)}
                        >
                          View Slip
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No past salary history recorded in the database.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Salary Receipt Dialog / Print View */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="rounded-3xl max-w-md bg-card max-h-[90vh] overflow-y-auto print:p-0">
          {selectedReceipt && (
            <div className="p-4 print:p-0" id="printable-receipt">
              <DialogHeader className="text-center border-b pb-4 mb-4">
                <DialogTitle className="font-serif text-2xl font-bold tracking-tight text-foreground">HomeBakers Marketplace</DialogTitle>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Salary Payout Slip</p>
              </DialogHeader>

              {/* Receipt details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 text-xs gap-y-2 border-b pb-4">
                  <div>
                    <p className="text-muted-foreground">Receipt ID:</p>
                    <p className="font-mono font-bold text-foreground">#{selectedReceipt.id.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Payment Date:</p>
                    <p className="font-bold text-foreground">
                      {selectedReceipt.paymentDate ? formatDate(selectedReceipt.paymentDate) : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery Partner:</p>
                    <p className="font-bold text-foreground">{user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Pay Period:</p>
                    <p className="font-bold text-foreground">
                      {MONTH_NAMES[selectedReceipt.month - 1]} {selectedReceipt.year}
                    </p>
                  </div>
                </div>

                {/* Salary breakdown table */}
                <div className="space-y-2 border-b pb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Salary Amount</span>
                    <span className="font-medium text-foreground">{formatCurrency(selectedReceipt.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-600 font-medium">Performance Bonus</span>
                    <span className="font-medium text-emerald-600">+{formatCurrency(selectedReceipt.bonus)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-500 font-medium">Standard Deductions</span>
                    <span className="font-medium text-rose-500">-{formatCurrency(selectedReceipt.deduction)}</span>
                  </div>
                </div>

                {/* Final Salary */}
                <div className="flex justify-between items-center bg-muted/40 p-4 rounded-xl border">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Net Disbursed Pay</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary">{formatCurrency(selectedReceipt.finalSalary)}</p>
                  </div>
                </div>

                {selectedReceipt.remarks && (
                  <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border">
                    <strong>Memo:</strong> {selectedReceipt.remarks}
                  </div>
                )}

                <div className="text-center text-[10px] text-muted-foreground pt-4 border-t">
                  Thank you for your valuable service in delivering sweets and treats safely!
                </div>
              </div>

              <DialogFooter className="pt-6 border-t gap-2 sm:gap-0 print:hidden">
                <Button type="button" variant="outline" className="rounded-xl h-10 text-xs font-bold" onClick={() => setIsReceiptOpen(false)}>Close</Button>
                <Button type="button" className="rounded-xl h-10 text-xs font-bold gap-1.5" onClick={handlePrintReceipt}>
                  <Printer className="size-3.5" /> Print Slip
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
