import { adminWriteGuard, json, readJson } from '@/lib/guard'
import { createProduct } from '@/lib/products'
import { fieldErrors, productSchema } from '@/lib/validate'
import { audit } from '@/lib/log'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const denied = await adminWriteGuard(req)
  if (denied) return denied
  const parsed = productSchema.safeParse(await readJson(req))
  if (!parsed.success) return json({ error: 'Data tidak valid.', fields: fieldErrors(parsed.error) }, 400)
  try {
    const p = await createProduct(parsed.data)
    audit('product_created', { id: p.id })
    return json(p, 201)
  } catch (e) {
    console.error('[products:create]', e)
    return json({ error: 'Gagal menyimpan.' }, 500)
  }
}
