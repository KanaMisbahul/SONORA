'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/* Munculkan elemen .reveal saat masuk layar. Dipindai ulang tiap pindah halaman. */
export function RevealObserver() {
  const pathname = usePathname()
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)')
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((e) => e.classList.add('in'))
      return
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.15 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [pathname])
  return null
}
