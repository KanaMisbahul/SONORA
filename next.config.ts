import type { NextConfig } from 'next'

/* Header statis. CSP (pakai nonce) dibuat per request di proxy.ts. */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // pglite hanya dipakai saat dev tanpa DATABASE_URL. Jangan ikut di-bundle.
  serverExternalPackages: ['@electric-sql/pglite'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default config
