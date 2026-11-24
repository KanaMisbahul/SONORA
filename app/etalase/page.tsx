import type { Metadata } from 'next'
import { Rail } from '@/components/Rail'

export const metadata: Metadata = { title: 'Etalase', description: 'Etalase alat musik SONORA per kategori.' }

export default function Etalase() {
  return (
    <main><section className="page"><div className="wrap">
      <h1 className="section-title reveal">Etalase</h1>
      <p className="sub page-sub reveal">Seret, geser, atau pakai panah untuk menjelajah. Daftar berulang tanpa ujung. Klik produk untuk melihat detail.</p>
      <Rail />
    </div></section></main>
  )
}
