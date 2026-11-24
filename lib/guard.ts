import 'server-only'
import { NextResponse } from 'next/server'
import { isAdmin } from './auth'
import { allow, clientIp, RULES, RateLimitUnavailable } from './ratelimit'
import { audit } from './log'

export const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

/* Tolak request tulis lintas-origin (CSRF). Origin wajib ada dan harus sama dengan Host. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!origin || !host) return false
  try { return new URL(origin).host === host } catch { return false }
}

/* Pagar standar endpoint admin yang menulis: origin, sesi, rate limit. Mengembalikan Response bila ditolak. */
export async function adminWriteGuard(req: Request): Promise<NextResponse | null> {
  if (!sameOrigin(req)) return json({ error: 'Origin tidak valid.' }, 403)
  if (!(await isAdmin())) return json({ error: 'Tidak diizinkan.' }, 401)
  try {
    if (!(await allow(RULES.adminWrite, clientIp(req)))) {
      audit('admin_write_limited', { ip: clientIp(req) })
      return json({ error: 'Terlalu banyak permintaan. Coba lagi sebentar.' }, 429, { 'Retry-After': '60' })
    }
  } catch (e) {
    if (e instanceof RateLimitUnavailable) return json({ error: 'Layanan belum siap.' }, 503)
    throw e
  }
  return null
}

/* Baca body JSON dengan batas ukuran. */
export async function readJson(req: Request, maxBytes = 20_000): Promise<unknown | undefined> {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return undefined
  const text = await req.text()
  if (text.length > maxBytes) return undefined
  try { return JSON.parse(text) } catch { return undefined }
}
