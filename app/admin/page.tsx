import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { isAdmin } from '@/lib/auth'

export const metadata: Metadata = { title: 'Seller Center', description: 'Halaman admin SONORA.', robots: { index: false, follow: false } }

/* Sesi dicek di server. Pengunjung tanpa sesi hanya menerima form login, tanpa data admin. */
export default async function AdminPage() {
  return <main><section className="page"><div className="wrap">{(await isAdmin()) ? <AdminDashboard /> : <AdminLogin />}</div></section></main>
}
