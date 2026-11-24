import { put } from '@vercel/blob'
import { adminWriteGuard, json } from '@/lib/guard'
import { audit } from '@/lib/log'

export const dynamic = 'force-dynamic'

const MAX = 2 * 1024 * 1024 // 2 MB

/* Tipe ditentukan dari isi file (magic bytes), bukan dari nama atau Content-Type kiriman klien. */
function sniff(b: Uint8Array): { type: string; ext: string } | null {
  if (b.length > 12 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { type: 'image/png', ext: 'png' }
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' }
  if (b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP') return { type: 'image/webp', ext: 'webp' }
  return null
}

export async function POST(req: Request) {
  const denied = await adminWriteGuard(req)
  if (denied) return denied
  if (!process.env.BLOB_READ_WRITE_TOKEN) return json({ error: 'Penyimpanan gambar belum dikonfigurasi.' }, 503)
  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > MAX + 10_000) return json({ error: 'File terlalu besar (maks 2 MB).' }, 413)
  let file: FormDataEntryValue | null
  try { file = (await req.formData()).get('file') } catch { return json({ error: 'Format tidak valid.' }, 400) }
  if (!(file instanceof File)) return json({ error: 'File tidak ada.' }, 400)
  if (file.size > MAX) return json({ error: 'File terlalu besar (maks 2 MB).' }, 413)
  const bytes = new Uint8Array(await file.arrayBuffer())
  const kind = sniff(bytes)
  if (!kind) return json({ error: 'Hanya PNG, JPEG, atau WebP.' }, 415)
  try {
    const blob = await put(`products/${crypto.randomUUID()}.${kind.ext}`, Buffer.from(bytes), { access: 'public', contentType: kind.type })
    audit('upload_ok', { bytes: bytes.length, type: kind.type })
    return json({ url: blob.url }, 201)
  } catch (e) {
    console.error('[upload]', e)
    return json({ error: 'Gagal mengunggah.' }, 500)
  }
}
