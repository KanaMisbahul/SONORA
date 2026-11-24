'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from './api'

export function AdminLogin() {
  const router = useRouter()
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const user = useRef<HTMLInputElement>(null)
  const pass = useRef<HTMLInputElement>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setErr('')
    const r = await api('POST', '/api/admin/login', { username: user.current!.value, password: pass.current!.value })
    setBusy(false)
    if (r.ok) { router.refresh(); return }
    setErr(r.data.error ?? 'Username atau password salah.')
    pass.current!.value = ''
    user.current!.focus()
  }

  return (
    <div className="login" id="loginView">
      <form className="login-card" id="loginForm" noValidate onSubmit={submit}>
        <h1>Login Admin</h1>
        <p className="sub">Masuk untuk mengelola katalog produk.</p>
        <div className="field"><label htmlFor="adminUser">Username</label>
          <input ref={user} id="adminUser" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={64} required aria-invalid={err ? true : undefined} /></div>
        <div className="field"><label htmlFor="adminPass">Password</label>
          <input ref={pass} id="adminPass" name="password" type="password" autoComplete="current-password" maxLength={200} required aria-invalid={err ? true : undefined} /></div>
        <p className="error" id="loginErr" role="alert" hidden={!err}>{err}</p>
        <button className="btn primary block" disabled={busy}>{busy ? 'Memeriksa...' : 'Masuk'}</button>
      </form>
    </div>
  )
}
