'use client'
import { useState } from 'react'
import { CATEGORIES } from '@/lib/types'
import { Icon } from './Icon'
import { ProductCard } from './ProductCard'
import { useStore } from './StoreProvider'

type Sort = 'featured' | 'low' | 'high' | 'az'

export function ProductBrowser({ initialCategory }: { initialCategory: string }) {
  const { products } = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(initialCategory)
  const [sort, setSort] = useState<Sort>('featured')

  const needle = q.toLowerCase()
  const list = products.filter((p) => (cat === 'Semua' || p.category === cat) && `${p.name} ${p.sub} ${p.desc}`.toLowerCase().includes(needle))
  if (sort === 'low') list.sort((a, b) => a.price - b.price)
  if (sort === 'high') list.sort((a, b) => b.price - a.price)
  if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <div className="toolbar">
        <div className="searchbox">
          <label className="sr-only" htmlFor="search">Cari produk</label><Icon name="magnifying-glass" />
          <input id="search" type="search" maxLength={80} placeholder="Cari gitar, keyboard, aksesoris..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label className="sr-only" htmlFor="categoryFilter">Kategori</label>
          <select id="categoryFilter" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="Semua">Semua kategori</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="sr-only" htmlFor="sortFilter">Urutkan</label>
          <select id="sortFilter" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="featured">Urutkan: Pilihan</option><option value="low">Harga terendah</option>
            <option value="high">Harga tertinggi</option><option value="az">Nama A-Z</option>
          </select>
        </div>
      </div>
      <p className="count-line" id="productCount" role="status">{list.length} produk tersedia</p>
      <div className="product-grid" id="productGrid">
        {list.length ? list.map((p) => <ProductCard key={p.id} p={p} />) : (
          <div className="empty"><Icon name="magnifying-glass" /><p>Produk tidak ditemukan. Coba kata kunci lain.</p>
            <button className="btn ghost small" onClick={() => { setQ(''); setCat('Semua') }}>Reset filter</button></div>
        )}
      </div>
    </>
  )
}
