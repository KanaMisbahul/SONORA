// Pakai: DATABASE_URL=... npm run db:setup
// Membuat tabel dan mengisi produk awal bila tabel masih kosong. Aman dijalankan berulang.
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) { console.error('DATABASE_URL belum diisi.'); process.exit(1) }
const sql = neon(url)
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
await sql.query(schema)
const [{ n }] = await sql.query('SELECT count(*)::int AS n FROM products')
if (n > 0) { console.log(`Tabel products sudah berisi ${n} baris. Seed dilewati.`); process.exit(0) }
const seed = JSON.parse(readFileSync(new URL('../db/products.seed.json', import.meta.url), 'utf8'))
for (const p of seed) {
  await sql.query(
    `INSERT INTO products (id,name,category,sub,price,stock,tag,image,cutout,description,spec,model)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
    [p.id, p.name, p.category, p.sub, p.price, p.stock, p.tag ?? '', p.image ?? '', !!p.cutout, p.description, p.spec ?? '', p.model ?? ''],
  )
}
await sql.query(`SELECT setval(pg_get_serial_sequence('products','id'), (SELECT max(id) FROM products))`)
console.log(`Seed selesai: ${seed.length} produk.`)
