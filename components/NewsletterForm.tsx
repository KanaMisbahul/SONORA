'use client'
import { useStore } from './StoreProvider'

/* Demo: belum terhubung ke layanan email. */
export function NewsletterForm() {
  const { toast } = useStore()
  return (
    <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); toast('Terima kasih! Email berhasil didaftarkan (demo).'); e.currentTarget.reset() }}>
      <div className="field"><label htmlFor="nlEmail">Email</label><input id="nlEmail" type="email" maxLength={120} placeholder="nama@email.com" autoComplete="email" required /></div>
      <button className="btn primary">Daftar</button>
    </form>
  )
}
