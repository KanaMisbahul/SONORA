# SONORA

Toko alat musik online. Next.js (App Router, TypeScript) + Neon Postgres + Vercel. Pesanan lewat WhatsApp.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local     # isi nilainya, lihat di bawah
npm run dev                    # http://localhost:3000
```

Tanpa `DATABASE_URL`, dev memakai Postgres in-memory (pglite) berisi produk contoh. Data hilang saat server berhenti.
Rate limit di dev memakai penghitung in-memory, jadi Upstash tidak wajib untuk dev.

## Env

| Variabel | Fungsi |
|---|---|
| `DATABASE_URL` | Neon Postgres (connection string pooled). Wajib di produksi. |
| `ADMIN_USERNAME` | Username admin tunggal. |
| `ADMIN_PASSWORD_HASH_B64` | Hash bcrypt dalam base64. Buat dengan `npm run hash-password`. |
| `SESSION_SECRET` | Kunci tanda tangan sesi, minimal 32 karakter. `openssl rand -base64 48`. Ganti nilainya = semua sesi admin batal. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limit login. Wajib di produksi: tanpa ini login ditolak (gagal tertutup). |
| `BLOB_READ_WRITE_TOKEN` | Upload foto produk ke Vercel Blob. |

File `.env*` tidak pernah di-commit (lihat `.gitignore`). Repo ini publik: jangan taruh rahasia di kode.

## Deploy ke Vercel

1. Import repo di Vercel (framework Next.js terdeteksi otomatis).
2. Storage: tambah **Neon** (Marketplace), **Blob**, dan **Upstash Redis**. Env terkait terisi otomatis.
3. Isi `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH_B64`, `SESSION_SECRET` di Settings > Environment Variables.
4. Buat tabel dan isi produk awal sekali saja: `DATABASE_URL=... npm run db:setup`.
5. Firewall > Rate Limiting: satu aturan untuk path `/api/` (misal 100 permintaan per menit per IP). Lapisan tambahan di luar rate limit login di kode.

## Keamanan (ringkas)

- Auth: bcrypt (cost 12), sesi JWT HS256 di cookie `HttpOnly; Secure; SameSite=Strict` (`__Host-` di produksi), 8 jam.
- Semua endpoint `/api/admin/*` cek sesi di server, cek `Origin`, dan kena rate limit.
- Validasi zod di server. Query selalu terparameter. Constraint tambahan di skema database.
- Upload: maks 2 MB, tipe dari magic bytes (PNG/JPEG/WebP), nama file acak.
- URL gambar/model dibatasi ke `/img`, `/models`, Vercel Blob, dan Unsplash (https saja).
- Header: CSP bernonce (`script-src` ketat), HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Keranjang di browser hanya menyimpan id + jumlah. Harga selalu dari database.

## Struktur

```
app/            halaman + route handler (api/admin/*)
components/     UI (client) dan components/admin
lib/            db, auth, validasi, rate limit, guard
db/             schema.sql, products.seed.json
scripts/        db-setup, hash-password
proxy.ts        CSP per request (nonce)
public/img/     foto produk contoh
```
