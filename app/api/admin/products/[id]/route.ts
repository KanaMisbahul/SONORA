import { adminWriteGuard, json, readJson } from '@/lib/guard'
import { deleteProduct, updateProduct } from '@/lib/products'
import { fieldErrors, idSchema, productSchema } from '@/lib/validate'
import { audit } from '@/lib/log'

export const dynamic = 'force-dynamic'
type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, ctx: Ctx) {
  const denied = await adminWriteGuard(req)
  if (denied) return denied
  const id = idSchema.safeParse((await ctx.params).id)
  if (!id.success) return json({ error: 'ID tidak valid.' }, 400)
  const parsed = productSchema.safeParse(await readJson(req))
  if (!parsed.success) return json({ error: 'Data tidak valid.', fields: fieldErrors(parsed.error) }, 400)
  try {
    const p = await updateProduct(id.data, parsed.data)
    if (!p) return json({ error: 'Produk tidak ditemukan.' }, 404)
    audit('product_updated', { id: p.id })
    return json(p)
  } catch (e) {
    console.error('[products:update]', e)
    return json({ error: 'Gagal menyimpan.' }, 500)
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const denied = await adminWriteGuard(req)
  if (denied) return denied
  const id = idSchema.safeParse((await ctx.params).id)
  if (!id.success) return json({ error: 'ID tidak valid.' }, 400)
  try {
    if (!(await deleteProduct(id.data))) return json({ error: 'Produk tidak ditemukan.' }, 404)
    audit('product_deleted', { id: id.data })
    return json({ ok: true })
  } catch (e) {
    console.error('[products:delete]', e)
    return json({ error: 'Gagal menghapus.' }, 500)
  }
}
