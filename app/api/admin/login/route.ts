import { checkCredentials, startSession } from '@/lib/auth'
import { audit } from '@/lib/log'
import { allow, clientIp, RULES, RateLimitUnavailable } from '@/lib/ratelimit'
import { json, readJson, sameOrigin } from '@/lib/guard'
import { loginSchema } from '@/lib/validate'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Origin tidak valid.' }, 403)
  const ip = clientIp(req)
  try {
    if (!(await allow(RULES.loginIp, ip))) {
      audit('login_limited', { ip, scope: 'ip' })
      return json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }, 429, { 'Retry-After': '900' })
    }
    const parsed = loginSchema.safeParse(await readJson(req, 2_000))
    if (!parsed.success) return json({ error: 'Username atau password salah.' }, 400)
    const { username, password } = parsed.data
    if (!(await allow(RULES.loginUser, `${ip}:${username.toLowerCase()}`))) {
      audit('login_limited', { ip, scope: 'user' })
      return json({ error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }, 429, { 'Retry-After': '900' })
    }
    if (!(await checkCredentials(username, password))) {
      audit('login_failed', { ip })
      return json({ error: 'Username atau password salah.' }, 401)
    }
    await startSession()
    audit('login_ok', { ip })
    return json({ ok: true })
  } catch (e) {
    console.error('[login]', e instanceof RateLimitUnavailable ? e.message : e)
    return json({ error: 'Layanan belum siap. Hubungi pengelola.' }, 503)
  }
}
