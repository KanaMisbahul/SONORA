'use client'
import type { Product } from '@/lib/types'
import { rupiah } from '@/lib/store'
import { Icon } from './Icon'
import { SafeImg } from './SafeImg'
import { useStore } from './StoreProvider'

export function ProductCard({ p }: { p: Product }) {
  const { openDetail, addToCart } = useStore()
  const out = p.stock <= 0, low = !out && p.stock <= 5
  return (
    <article className="product">
      <div className={'product-img' + (p.cutout ? ' cut' : '')}>
        <SafeImg src={p.image} alt={p.name} loading="lazy" decoding="async" />
      </div>
      <div className="product-info">
        <div className="product-meta"><span>{p.category} / {p.sub}</span>{p.tag && <b>{p.tag}</b>}</div>
        <h3>{p.name}</h3>
        <p className="product-desc">{p.desc}</p>
        <div className="price-row"><div>
          <div className="price">{rupiah(p.price)}</div>
          {low && <span className="stock-note">Sisa {p.stock} unit</span>}
          {out && <span className="stock-note">Stok habis</span>}
        </div></div>
        <div className="product-actions">
          <button className="btn ghost small" onClick={() => openDetail(p.id)}>Lihat detail</button>
          <button className="btn small" disabled={out} onClick={() => addToCart(p.id)}><Icon name="plus" /> Keranjang</button>
        </div>
      </div>
    </article>
  )
}
