/* Baca env saat dipakai (bukan saat import), supaya build tidak gagal tanpa rahasia. */
function need(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Env ${name} belum diisi. Lihat .env.example.`)
  return v
}

export const env = {
  get databaseUrl() {
    return process.env.DATABASE_URL || ''
  },
  get adminUsername() {
    return need('ADMIN_USERNAME')
  },
  get adminPasswordHash() {
    return Buffer.from(need('ADMIN_PASSWORD_HASH_B64'), 'base64').toString('utf8')
  },
  get sessionSecret() {
    const s = need('SESSION_SECRET')
    if (s.length < 32) throw new Error('SESSION_SECRET minimal 32 karakter.')
    return s
  },
  get isProd() {
    return process.env.NODE_ENV === 'production'
  },
}
