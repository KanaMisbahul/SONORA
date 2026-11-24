/* Konfigurasi toko dan helper tampilan. Nomor WhatsApp: format internasional tanpa + (0822... jadi 62822...). */
export const STORE = { name: 'SONORA', whatsapp: '6282237934990' } as const

export const waLink = (text: string) =>
  `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`

export const WA_DEFAULT = 'Halo SONORA, saya ingin bertanya tentang produk.'

export const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export const NAV = [
  ['/', 'Beranda'],
  ['/etalase', 'Etalase'],
  ['/produk', 'Produk'],
  ['/tentang', 'Tentang'],
] as const

export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#26272a"/><text x="400" y="310" fill="#8a8d92" font-family="sans-serif" font-size="28" letter-spacing="8" text-anchor="middle">SONORA</text></svg>',
  )
