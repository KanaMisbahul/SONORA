'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { NAV, WA_DEFAULT, waLink } from '@/lib/store'
import { Icon } from './Icon'
import { useStore } from './StoreProvider'

export function Header() {
  const { cartCount, openCart, openMenu, menuOpen } = useStore()
  return (
    <header className="header"><div className="wrap nav">
      <Link className="brand" href="/">SONORA</Link>
      <div className="actions">
        <a className="iconbtn" href={waLink(WA_DEFAULT)} target="_blank" rel="noopener noreferrer" title="Chat WhatsApp" aria-label="Chat via WhatsApp"><Icon name="whatsapp-logo" fill /></a>
        <button className="iconbtn" title="Keranjang" aria-label="Keranjang" onClick={openCart}>
          <Icon name="shopping-cart-simple" /><span className="count" id="cartCount" hidden={cartCount === 0}>{cartCount}</span>
        </button>
        <button className="menu-btn" id="menuBtn" aria-expanded={menuOpen} aria-controls="menu" onClick={openMenu}>Menu <Icon name="plus" /></button>
      </div>
    </div></header>
  )
}

export function Menu() {
  const { menuOpen, closeMenu } = useStore()
  const pathname = usePathname()
  const root = useRef<HTMLDivElement>(null)
  const last = useRef<HTMLElement | null>(null)
  const was = useRef(false)
  useEffect(() => {
    if (menuOpen && !was.current) {
      last.current = document.activeElement as HTMLElement | null
      root.current?.querySelector<HTMLElement>('.menu-toggle')?.focus()
    } else if (!menuOpen && was.current) {
      last.current?.focus?.()
    }
    was.current = menuOpen
  }, [menuOpen])
  return (
    <div ref={root} className={'menu' + (menuOpen ? ' open' : '')} id="menu" aria-hidden={!menuOpen} inert={!menuOpen}>
      <div className="menu-scrim" onClick={closeMenu} />
      <div className="menu-layer l1" /><div className="menu-layer l2" />
      <aside className="menu-panel" role="dialog" aria-modal="true" aria-label="Menu utama">
        <button className="menu-toggle" onClick={closeMenu}>Tutup <Icon name="x" /></button>
        <nav aria-label="Utama"><ol className="menu-list">
          {NAV.map(([href, label], i) => (
            <li key={href} style={{ '--i': i } as React.CSSProperties}>
              <Link href={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>
            </li>
          ))}
        </ol></nav>
        <div className="menu-foot">
          <a className="btn primary block" href={waLink(WA_DEFAULT)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp-logo" fill /> Chat WhatsApp</a>
          <Link className="btn ghost block" href="/admin">Seller/Admin</Link>
        </div>
      </aside>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="footer"><div className="wrap footer-inner">
      <span className="brand">SONORA</span>
      <span>&copy; 2026 SONORA. Prototype interaktif.</span>
      <a href="#layoutTop">Kembali ke atas <Icon name="arrow-up" /></a>
    </div></footer>
  )
}
