import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import '@phosphor-icons/web/regular/style.css'
import '@phosphor-icons/web/fill/style.css'
import './globals.css'
import { StoreProvider } from '@/components/StoreProvider'
import { RevealObserver } from '@/components/RevealObserver'
import { getProducts } from '@/lib/products'

export const metadata: Metadata = {
  title: { default: 'SONORA - Toko Alat Musik Online', template: '%s - SONORA' },
  description: 'Toko alat musik online: gitar, keyboard, ukulele, dan aksesoris.',
}
export const viewport: Viewport = { colorScheme: 'light dark', width: 'device-width', initialScale: 1 }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Membaca header membuat semua halaman dirender dinamis, syarat CSP bernonce.
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const products = await getProducts()
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Kelas "js" dipasang sebelum cat pertama supaya .reveal tidak berkedip. Teks tetap, bukan input pengguna. */}
        <script nonce={nonce}>{"document.documentElement.classList.add('js')"}</script>
      </head>
      <body>
        <StoreProvider products={products}>{children}</StoreProvider>
        <RevealObserver />
      </body>
    </html>
  )
}
