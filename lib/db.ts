import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { neon } from '@neondatabase/serverless'
import { env } from './env'

/* Satu pintu query. Selalu terparameter ($1, $2, ...). Jangan pernah menyambung string SQL dari input.
   Produksi: Neon (DATABASE_URL wajib).
   Dev tanpa DATABASE_URL: Postgres in-memory (pglite, devDependency) dengan skema + seed yang sama. */
type Row = Record<string, unknown>
type Runner = (text: string, params?: unknown[]) => Promise<Row[]>

/* globalThis: dev (HMR, bundel terpisah per route) tidak boleh membuat banyak database in-memory. */
const g = globalThis as { __sonoraDb?: Promise<Runner> }

async function init(): Promise<Runner> {
  if (env.databaseUrl) {
    const sql = neon(env.databaseUrl)
    return async (text, params = []) => (await sql.query(text, params)) as Row[]
  }
  if (env.isProd) throw new Error('DATABASE_URL wajib diisi di produksi.')
  console.warn('[db] DATABASE_URL kosong: memakai Postgres in-memory (pglite), data hilang saat server berhenti.')
  const { PGlite } = await import('@electric-sql/pglite')
  const db = new PGlite()
  await db.exec(readFileSync(join(process.cwd(), 'db/schema.sql'), 'utf8'))
  const seed = JSON.parse(readFileSync(join(process.cwd(), 'db/products.seed.json'), 'utf8')) as Row[]
  for (const p of seed) await insertSeed((t, v) => db.query(t, v).then((r) => r.rows as Row[]), p)
  await db.query(`SELECT setval(pg_get_serial_sequence('products','id'), (SELECT max(id) FROM products))`)
  return async (text, params = []) => (await db.query(text, params)).rows as Row[]
}

export async function insertSeed(run: Runner, p: Row) {
  await run(
    `INSERT INTO products (id,name,category,sub,price,stock,tag,image,cutout,description,spec,model)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
    [p.id, p.name, p.category, p.sub, p.price, p.stock, p.tag ?? '', p.image ?? '', !!p.cutout, p.description, p.spec ?? '', p.model ?? ''],
  )
}

export async function query(text: string, params: unknown[] = []): Promise<Row[]> {
  g.__sonoraDb ??= init()
  return (await g.__sonoraDb)(text, params)
}
