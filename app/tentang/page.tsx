import type { Metadata } from 'next'
import { Icon } from '@/components/Icon'
import { WA_DEFAULT, waLink } from '@/lib/store'

export const metadata: Metadata = { title: 'Tentang', description: 'Tentang SONORA dan cara memesan.' }
const d = (i: number) => ({ '--i': i }) as React.CSSProperties

export default function Tentang() {
  return (
    <main><section className="page"><div className="wrap about-grid">
      <div className="about-copy reveal">
        <h1 className="section-title" style={{ marginBottom: 16 }}>Tentang SONORA</h1>
        <p>Toko alat musik online untuk gitar, keyboard, ukulele, dan aksesoris. Pesanan masuk lewat WhatsApp.</p>
        <a className="btn primary" style={{ marginTop: 24 }} href={waLink(WA_DEFAULT)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp-logo" fill /> Chat WhatsApp</a>
      </div>
      <ol className="how" aria-label="Cara pesan">
        <li className="reveal" style={d(1)}><b>Pilih</b><span>Cari berdasarkan kategori atau nama. Spesifikasi, stok, dan pratinjau 3D (jika ada) tampil di halaman detail.</span></li>
        <li className="reveal" style={d(2)}><b>Keranjang</b><span>Atur jumlah sesuai stok yang tersedia.</span></li>
        <li className="reveal" style={d(3)}><b>Pesan</b><span>Isi nama dan catatan, lalu rincian pesanan terkirim ke WhatsApp toko.</span></li>
      </ol>
    </div></section></main>
  )
}
