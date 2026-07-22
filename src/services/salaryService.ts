/*
 File: src/services/salaryService.ts
 Purpose: Client-side API service helpers for managing delivery partner salaries.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

export interface SalaryRecord {
  id: string
  deliveryPartnerId: string
  partnerName: string
  partnerEmail: string
  partnerPhone: string
  partnerReferenceId?: string
  month: number
  year: number
  baseSalary: number
  bonus: number
  deduction: number
  finalSalary: number
  paymentStatus: 'pending' | 'paid'
  paymentDate: string | null
  remarks: string | null
  createdAt: string
}

export interface PartnerSalaryStats {
  id: string
  referenceId?: string
  name: string
  email: string
  phone: string | null
  vehicleType: 'bike' | 'scooter' | 'car'
  totalDeliveriesCompleted: number
  salary: {
    id: string
    baseSalary: number
    bonus: number
    deduction: number
    finalSalary: number
    paymentStatus: 'pending' | 'paid'
    paymentDate: string | null
    remarks: string | null
  } | null
}

export async function getSalaryPartners(month: number, year: number): Promise<PartnerSalaryStats[]> {
  const res = await fetch(`${API_BASE}/api/admin/salaries/partners?month=${month}&year=${year}`)
  if (!res.ok) throw new Error('Failed to fetch salary partner stats')
  return await res.json()
}

export async function createSalary(data: {
  deliveryPartnerId: string
  month: number
  year: number
  baseSalary: number
  bonus: number
  deduction: number
  remarks?: string
}): Promise<{ success: boolean; salaryId: string }> {
  const res = await fetch(`${API_BASE}/api/admin/salaries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to save salary record')
  return await res.json()
}

export async function updateSalary(
  id: string,
  data: {
    month: number
    year: number
    baseSalary: number
    bonus: number
    deduction: number
    remarks?: string
  }
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/admin/salaries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update salary record')
  return await res.json()
}

export async function paySalary(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/admin/salaries/${id}/pay`, {
    method: 'PATCH',
  })
  if (!res.ok) throw new Error('Failed to process salary payment')
  return await res.json()
}

export async function getSalaries(filters: {
  search?: string
  month?: number
  year?: number
  status?: string
}): Promise<SalaryRecord[]> {
  const params = new URLSearchParams()
  if (filters.search) params.append('search', filters.search)
  if (filters.month) params.append('month', String(filters.month))
  if (filters.year) params.append('year', String(filters.year))
  if (filters.status && filters.status !== 'all') params.append('status', filters.status)

  const res = await fetch(`${API_BASE}/api/admin/salaries?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch salary records')
  return await res.json()
}

export async function getPartnerSalaries(partnerId: string): Promise<SalaryRecord[]> {
  const res = await fetch(`${API_BASE}/api/salaries/partner/${partnerId}`)
  if (!res.ok) throw new Error('Failed to fetch partner salary history')
  return await res.json()
}
