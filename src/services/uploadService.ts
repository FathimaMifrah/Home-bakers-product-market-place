/*
 File: src/services/uploadService.ts
 Purpose: Client-side API service helpers.
 Main exports: Exports or main definitions
 */

// API_BASE: Helper or component used in this file.
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000'

// uploadImage: Helper or component used in this file.
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error('Failed to upload image')
  }

  const data = await res.json()
  return data.url
}