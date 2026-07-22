/*
 File: src/components/layout/ScrollToHash.tsx
 Purpose: Reusable React UI component.
 Main exports: ScrollToHash
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'


// ScrollToHash: Helper or component used in this file.
export function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    const scroll = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    // Delay so the target page/section has rendered
    const timer = window.setTimeout(scroll, 100)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return null
}