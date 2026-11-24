'use client'
import { ProductCard } from './ProductCard'
import { useStore } from './StoreProvider'

/* Produk berlabel lebih dulu, lalu sisanya. Ambil 4. */
export function FeaturedGrid() {
  const { products } = useStore()
  const list = [...products.filter((p) => p.tag), ...products.filter((p) => !p.tag)].slice(0, 4)
  return <div className="product-grid" id="featuredGrid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
}
