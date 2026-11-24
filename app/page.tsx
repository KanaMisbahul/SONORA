import Link from 'next/link'
import { FeaturedGrid } from '@/components/FeaturedGrid'
import { NewsletterForm } from '@/components/NewsletterForm'
import { SafeImg } from '@/components/SafeImg'

export default function Home() {
  return (
    <main>
      <section className="hero"><div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 className="rise">Gitar, keyboard, dan ukulele.</h1>
          <p className="rise" style={{ '--i': 1 } as React.CSSProperties}>Dari alat pertama sampai panggung kecil. Pilih, masukkan keranjang, lalu pesan lewat WhatsApp.</p>
          <div className="hero-actions rise" style={{ '--i': 2 } as React.CSSProperties}>
            <Link className="btn primary" href="/produk">Lihat produk</Link>
            <Link className="btn ghost" href="/etalase">Lihat etalase</Link>
          </div>
        </div>
        <div className="hero-photo rise" style={{ '--i': 1 } as React.CSSProperties}>
          <SafeImg src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1400&q=80" alt="Gitar akustik" fetchPriority="high" />
        </div>
      </div></section>

      <section id="featured" style={{ paddingTop: 64 }}><div className="wrap">
        <div className="section-head reveal"><h2 className="section-title">Produk pilihan</h2><Link className="btn ghost" href="/produk">Lihat semua produk</Link></div>
        <FeaturedGrid />
      </div></section>

      <section className="newsletter"><div className="wrap"><div className="newsletter-inner reveal">
        <div><h2>Kabar koleksi terbaru</h2><p>Info koleksi dan penawaran baru langsung ke email kamu.</p></div>
        <NewsletterForm />
      </div></div></section>
    </main>
  )
}
