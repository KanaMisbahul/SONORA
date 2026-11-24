import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env } from './env'

/* Rate limit. Produksi: Upstash Redis (wajib, gagal tertutup bila belum dikonfigurasi).
   Dev: penghitung in-memory per proses. */
type Rule = { name: string; max: number; windowSec: number }

export const RULES = {
  loginIp: { name: 'login-ip', max: 20, windowSec: 15 * 60 },
  loginUser: { name: 'login-user', max: 5, windowSec: 15 * 60 },
  adminWrite: { name: 'admin-write', max: 60, windowSec: 60 },
} satisfies Record<string, Rule>

export class RateLimitUnavailable extends Error {}

const hasUpstash = () => !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN
const limiters = new Map<string, Ratelimit>()
const gm = globalThis as { __sonoraRl?: Map<string, number[]> }
const memory = (gm.__sonoraRl ??= new Map<string, number[]>())

function upstash(rule: Rule) {
  let l = limiters.get(rule.name)
  if (!l) {
    l = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(rule.max, `${rule.windowSec} s`),
      prefix: `sonora:${rule.name}`,
    })
    limiters.set(rule.name, l)
  }
  return l
}

/* true = boleh lanjut, false = kena limit. */
export async function allow(rule: Rule, key: string): Promise<boolean> {
  if (hasUpstash()) return (await upstash(rule).limit(key)).success
  if (env.isProd) throw new RateLimitUnavailable('UPSTASH_REDIS_REST_URL/TOKEN belum diisi.')
  const now = Date.now(), k = `${rule.name}:${key}`
  const hits = (memory.get(k) ?? []).filter((t) => now - t < rule.windowSec * 1000)
  if (hits.length >= rule.max) { memory.set(k, hits); return false }
  hits.push(now); memory.set(k, hits)
  return true
}

export function clientIp(req: Request): string {
  return req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}
