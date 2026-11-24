import 'server-only'
import { cookies } from 'next/headers'
import { compare } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { env } from './env'

const MAX_AGE = 60 * 60 * 8 // 8 jam
/* Prefix __Host- mewajibkan Secure, Path=/, tanpa Domain. Hanya dipakai di produksi (HTTPS). */
const COOKIE = env.isProd ? '__Host-sonora_session' : 'sonora_session'
const key = () => new TextEncoder().encode(env.sessionSecret)

/* Hash dummy supaya waktu respons sama, baik username benar maupun salah. */
const DUMMY = '$2b$12$7tuoz5TBPLOVxsSxoKCv3.uvs79WmC7yxg7wNda0KJD/On3QKQiou'

export async function checkCredentials(username: string, password: string): Promise<boolean> {
  const userOk = username === env.adminUsername
  const passOk = await compare(password, userOk ? env.adminPasswordHash : DUMMY)
  return userOk && passOk
}

export async function startSession() {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('admin')
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key())
  const jar = await cookies()
  jar.set(COOKIE, token, { httpOnly: true, secure: env.isProd, sameSite: 'strict', path: '/', maxAge: MAX_AGE })
}

export async function endSession() {
  const jar = await cookies()
  jar.set(COOKIE, '', { httpOnly: true, secure: env.isProd, sameSite: 'strict', path: '/', maxAge: 0 })
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return false
  try {
    await jwtVerify(token, key(), { algorithms: ['HS256'], subject: 'admin' })
    return true
  } catch {
    return false
  }
}
