'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/lib/types'
import { FALLBACK_IMG, rupiah } from '@/lib/store'
import { mountRail } from './rail-engine'
import { useStore } from './StoreProvider'

/* Rel gantung. Engine imperatif (fisika pegas + drag) dipasang ke satu elemen lewat ref. */
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export function Rail() {
  const { products, openDetail } = useStore()
  const router = useRouter()
  const root = useRef<HTMLDivElement>(null)
  const open = useRef(openDetail)
  const nav = useRef(router.push)
  open.current = openDetail
  nav.current = router.push
  useEffect(() => {
    if (!root.current) return
    return mountRail(root.current, {
      products, cats: [...CATEGORIES], rupiah, esc, fallback: FALLBACK_IMG,
      onOpen: (id: number) => open.current(id),
      navigate: (href: string) => nav.current(href),
    })
  }, [products])
  return <div ref={root} id="railMount" className="reveal" />
}
