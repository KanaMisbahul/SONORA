import { NextResponse, type NextRequest } from 'next/server'

/* CSP per request dengan nonce. Konsekuensi: semua halaman dirender dinamis (bukan statis). */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const dev = process.env.NODE_ENV === 'development'
  const blob = 'https://*.public.blob.vercel-storage.com'
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    // Gaya inline diizinkan: atribut style="--i:1" dari SSR dan <style> milik model-viewer (shadow DOM) tidak bisa diberi nonce.
    // Risiko injeksi CSS jauh lebih kecil daripada injeksi script; script-src tetap ketat (nonce + strict-dynamic).
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://images.unsplash.com ${blob}`,
    `font-src 'self'`,
    // model-viewer memuat model lewat fetch (blob: untuk pratinjau lokal) dan decoder dari gstatic bila perlu
    `connect-src 'self' blob: data: ${blob} https://www.gstatic.com${dev ? ' ws:' : ''}`,
    `worker-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')

  const headers = new Headers(request.headers)
  headers.set('x-nonce', nonce)
  headers.set('Content-Security-Policy', csp)
  const res = NextResponse.next({ request: { headers } })
  res.headers.set('Content-Security-Policy', csp)
  return res
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|img/|models/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
