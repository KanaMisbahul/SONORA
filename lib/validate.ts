import { z } from 'zod'
import { CATEGORIES } from './types'

/* URL gambar/model yang diizinkan: file milik sendiri (/img, /models), Vercel Blob, atau Unsplash (foto seed).
   Skema selain https (javascript:, data:, http:) ditolak. */
const ALLOWED_HOSTS = [/\.public\.blob\.vercel-storage\.com$/i, /^images\.unsplash\.com$/i]

export function isAllowedAssetUrl(v: string, exts?: RegExp): boolean {
  if (/^\/(img|models)\/[\w.\-]+$/.test(v)) return !exts || exts.test(v)
  try {
    const u = new URL(v)
    if (u.protocol !== 'https:' || u.username || u.password) return false
    if (!ALLOWED_HOSTS.some((r) => r.test(u.hostname))) return false
    return !exts || exts.test(u.pathname)
  } catch {
    return false
  }
}

const text = (min: number, max: number) => z.string().trim().min(min).max(max)
const optionalAsset = (exts?: RegExp) =>
  z.string().trim().max(500).refine((v) => v === '' || isAllowedAssetUrl(v, exts), 'URL tidak diizinkan')

export const productSchema = z.object({
  name: text(1, 80),
  category: z.enum(CATEGORIES),
  sub: text(1, 40),
  price: z.number().int().min(0).max(1_000_000_000),
  stock: z.number().int().min(0).max(100_000),
  tag: z.string().trim().max(24),
  image: optionalAsset(),
  cutout: z.boolean(),
  desc: text(1, 500),
  spec: z.string().trim().max(120),
  model: optionalAsset(/\.(glb|gltf)$/i),
}).strict()

export type ProductInput = z.infer<typeof productSchema>

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(200),
}).strict()

export const idSchema = z.coerce.number().int().positive().max(2_147_483_647)

/* Ubah error zod jadi { field: pesan } tanpa membocorkan detail internal. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const i of err.issues) out[String(i.path[0] ?? '_')] ??= i.message
  return out
}
