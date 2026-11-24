'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { CartLine, Product } from '@/lib/types'
import { Header, Menu, Footer } from './Chrome'
import { DetailModal } from './DetailModal'
import { CartModal } from './CartModal'

type Ctx = {
  products: Product[]
  cart: CartLine[]
  cartCount: number
  addToCart: (id: number, qty?: number) => void
  setQty: (id: number, qty: number) => void
  removeFromCart: (id: number) => void
  detailId: number | null
  openDetail: (id: number) => void
  closeDetail: () => void
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
  menuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
  toast: (msg: string) => void
  toastMsg: string
  toastShow: boolean
}

const StoreCtx = createContext<Ctx | null>(null)
export const useStore = () => {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('useStore di luar StoreProvider')
  return c
}

const CART_KEY = 'sonora_cart'

/* localStorage bisa diubah pengguna: buang id yang tidak ada, qty tidak valid, dan batasi ke stok. */
function sanitize(raw: unknown, products: Product[]): CartLine[] {
  if (!Array.isArray(raw)) return []
  const byId = new Map(products.map((p) => [p.id, p]))
  const out = new Map<number, number>()
  for (const x of raw.slice(0, 100)) {
    if (!x || typeof x !== 'object') continue
    const id = Number((x as CartLine).id), qty = Number((x as CartLine).qty)
    const p = byId.get(id)
    if (!p || p.stock < 1 || !Number.isInteger(qty) || qty < 1) continue
    out.set(id, Math.min(p.stock, (out.get(id) ?? 0) + qty))
  }
  return [...out].map(([id, qty]) => ({ id, qty }))
}

export function StoreProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const pathname = usePathname()
  const [cart, setCart] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  /* Muat keranjang. Kunci lama (data produk di browser, wishlist) dibersihkan: sumber data kini database. */
  useEffect(() => {
    try {
      ;['sonora_products', 'sonora_seed_v', 'sonora_wishlist', 'sonora_admin'].forEach((k) => {
        localStorage.removeItem(k)
        sessionStorage.removeItem(k)
      })
      setCart(sanitize(JSON.parse(localStorage.getItem(CART_KEY) ?? '[]'), products))
    } catch { /* storage diblokir atau JSON rusak: mulai kosong */ }
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Data produk berubah (admin edit/hapus): sesuaikan keranjang. */
  useEffect(() => {
    if (!ready) return
    setCart((c) => {
      const n = sanitize(c, products)
      return JSON.stringify(n) === JSON.stringify(c) ? c : n
    })
  }, [products, ready])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch { /* penuh/diblokir */ }
  }, [cart, ready])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastShow(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastShow(false), 2400)
  }, [])

  const stockOf = useCallback((id: number) => products.find((p) => p.id === id)?.stock ?? 0, [products])
  const addToCart = useCallback((id: number, qty = 1) => {
    const max = stockOf(id)
    if (max < 1) return
    setCart((c) => {
      const row = c.find((x) => x.id === id)
      return row ? c.map((x) => (x.id === id ? { ...x, qty: Math.min(max, x.qty + qty) } : x)) : [...c, { id, qty: Math.min(max, qty) }]
    })
    toast('Produk ditambahkan ke keranjang')
  }, [stockOf, toast])
  const setQty = useCallback((id: number, qty: number) => {
    const max = stockOf(id)
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(max, qty)) } : x)))
  }, [stockOf])
  const removeFromCart = useCallback((id: number) => setCart((c) => c.filter((x) => x.id !== id)), [])

  const openDetail = useCallback((id: number) => setDetailId(id), [])
  const closeDetail = useCallback(() => setDetailId(null), [])
  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen || detailId !== null || cartOpen ? 'hidden' : ''
  }, [menuOpen, detailId, cartOpen])

  /* Escape menutup panel/modal. Tab dikunci di dalam dialog yang terbuka. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenuOpen(false); setDetailId(null); setCartOpen(false) }
      if (e.key !== 'Tab') return
      const m = document.querySelector('.menu.open .menu-panel') ?? document.querySelector('.modal-backdrop.show .modal')
      if (!m) return
      const f = [...m.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null)
      if (!f.length) return
      const a = f[0], z = f[f.length - 1]
      if (!m.contains(document.activeElement)) { e.preventDefault(); a.focus() }
      else if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const cartCount = useMemo(() => cart.reduce((s, x) => s + x.qty, 0), [cart])
  const value: Ctx = {
    products, cart, cartCount, addToCart, setQty, removeFromCart,
    detailId, openDetail, closeDetail, cartOpen, openCart, closeCart, menuOpen, openMenu, closeMenu,
    toast, toastMsg, toastShow,
  }

  return (
    <StoreCtx.Provider value={value}>
      <div id="layoutTop"><Header /><Menu /></div>
      {children}
      <div id="layoutBottom">
        <Footer />
        <DetailModal />
        <CartModal />
        <div className={'toast' + (toastShow ? ' show' : '')} id="toast" role="status" aria-live="polite">{toastMsg}</div>
      </div>
    </StoreCtx.Provider>
  )
}
