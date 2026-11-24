import 'server-only'
import { cache } from 'react'
import { query } from './db'
import type { Product } from './types'
import type { ProductInput } from './validate'

const COLS = 'id,name,category,sub,price,stock,tag,image,cutout,description,spec,model'

function map(r: Record<string, unknown>): Product {
  return {
    id: Number(r.id),
    name: String(r.name),
    category: r.category as Product['category'],
    sub: String(r.sub),
    price: Number(r.price),
    stock: Number(r.stock),
    tag: String(r.tag),
    image: String(r.image),
    cutout: Boolean(r.cutout),
    desc: String(r.description),
    spec: String(r.spec),
    model: String(r.model),
  }
}

/* cache(): satu query per request walau dipanggil dari layout dan page. */
export const getProducts = cache(async (): Promise<Product[]> =>
  (await query(`SELECT ${COLS} FROM products ORDER BY id`)).map(map),
)

const vals = (i: ProductInput) => [i.name, i.category, i.sub, i.price, i.stock, i.tag, i.image, i.cutout, i.desc, i.spec, i.model]

export async function createProduct(i: ProductInput): Promise<Product> {
  const rows = await query(
    `INSERT INTO products (name,category,sub,price,stock,tag,image,cutout,description,spec,model)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING ${COLS}`,
    vals(i),
  )
  return map(rows[0])
}

export async function updateProduct(id: number, i: ProductInput): Promise<Product | null> {
  const rows = await query(
    `UPDATE products SET name=$1,category=$2,sub=$3,price=$4,stock=$5,tag=$6,image=$7,cutout=$8,description=$9,spec=$10,model=$11,updated_at=now()
     WHERE id=$12 RETURNING ${COLS}`,
    [...vals(i), id],
  )
  return rows[0] ? map(rows[0]) : null
}

export async function deleteProduct(id: number): Promise<boolean> {
  return (await query('DELETE FROM products WHERE id=$1 RETURNING id', [id])).length > 0
}
