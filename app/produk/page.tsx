import type { Metadata } from 'next'
import { ProductBrowser } from '@/components/ProductBrowser'
import { CATEGORIES } from '@/lib/types'

export const metadata: Metadata = { title: 'Produk', description: 'Semua produk SONORA: gitar, keyboard, ukulele, dan aksesoris.' }

export default async function Produk({ searchParams }: { searchParams: Promise<{ kategori?: string | string[] }> }) {
  const { kategori } = await searchParams
  const k = Array.isArray(kategori) ? kategori[0] : kategori
  const initial = (CATEGORIES as readonly string[]).includes(k ?? '') ? (k as string) : 'Semua'
  return (
    <main><section className="page"><div className="wrap">
      <h1 className="section-title reveal">Produk</h1>
      <ProductBrowser key={initial} initialCategory={initial} />
    </div></section></main>
  )
}
