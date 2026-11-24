// Pakai: npm run hash-password
// Mengeluarkan nilai untuk ADMIN_PASSWORD_HASH_B64 (base64 dari hash bcrypt, aman dari masalah tanda $ di file .env).
import { hash } from 'bcryptjs'
import { createInterface } from 'node:readline'

const rl = createInterface({ input: process.stdin, output: process.stderr })
rl.question('Password admin (min 12 karakter): ', async (pw) => {
  rl.close()
  if (pw.length < 12) { console.error('Terlalu pendek.'); process.exit(1) }
  const h = await hash(pw, 12)
  console.log('\nADMIN_PASSWORD_HASH_B64=' + Buffer.from(h).toString('base64'))
})
