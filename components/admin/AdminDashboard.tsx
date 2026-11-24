'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { rupiah } from '@/lib/store'
import type { Product } from '@/lib/types'
import { Icon } from '../Icon'
import { useStore } from '../StoreProvider'
import { api } from './api'
import { ProductForm } from './ProductForm'

type Tab = { t: 'overview' } | { t: 'products' } | { t: 'form'; product?: Product }

export function AdminDashboard() {
  const router = useRouter()
  const { products, toast } = useStore()
  const [tab, setTab] = useState<Tab>({ t: 'overview' })

  async function logout() {
    await api('POST', '/api/admin/logout')
    toast('Berhasil keluar')
    router.refresh()
  }
  async function remove(p: Product) {
    if (!confirm(`Hapus "${p.name}"?`)) return
    const r = await api('DELETE', `/api/admin/products/${p.id}`)
    if (r.ok) { toast('Produk dihapus'); router.refresh() }
    else if (r.status === 401) router.refresh()
    else toast(r.data.error ?? 'Gagal menghapus')
  }
  const saved = () => { toast('Data produk berhasil disimpan'); setTab({ t: 'products' }); router.refresh() }
  const cls = (t: Tab['t']) => (tab.t === t || (t === 'form' && tab.t === 'form') ? 'active' : undefined)

  return (
    <div id="adminView">
      <div className="admin-bar"><h1 className="section-title" id="adminTitle">Seller Center</h1><button className="btn ghost" id="logoutBtn" onClick={logout}>Keluar</button></div>
      <div className="panel"><div className="admin-layout">
        <div className="admin-menu">
          <button className={cls('overview')} onClick={() => setTab({ t: 'overview' })}>Ringkasan</button>
          <button className={cls('products')} onClick={() => setTab({ t: 'products' })}>Produk</button>
          <button className={tab.t === 'form' && !tab.product ? 'active' : undefined} onClick={() => setTab({ t: 'form' })}>Tambah produk</button>
        </div>
        <div className="admin-content" id="adminContent">
          {tab.t === 'overview' && (
            <>
              <h2>Ringkasan toko</h2>
              <div className="admin-stats">
                <div className="stat"><small>Total produk</small><b>{products.length}</b></div>
                <div className="stat"><small>Total stok</small><b>{products.reduce((s, p) => s + p.stock, 0)}</b></div>
                <div className="stat"><small>Stok habis</small><b>{products.filter((p) => p.stock === 0).length}</b></div>
              </div>
              <p className="sub" style={{ marginBottom: 16 }}>Kelola katalog dan persediaan tokomu dari sini. Perubahan langsung terlihat oleh semua pengunjung.</p>
              <button className="btn primary" onClick={() => setTab({ t: 'form' })}><Icon name="plus" /> Tambah produk</button>
            </>
          )}
          {tab.t === 'products' && (
            <>
              <h2>Kelola produk</h2>
              <div style={{ overflow: 'auto' }}><table className="admin-table">
                <thead><tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Aksi</th></tr></thead>
                <tbody>{products.map((p) => (
                  <tr key={p.id}><td>{p.name}</td><td>{p.category}</td><td className="mono">{rupiah(p.price)}</td><td className="mono">{p.stock}</td>
                    <td><button className="btn ghost small" onClick={() => setTab({ t: 'form', product: p })}>Edit</button>{' '}
                      <button className="btn ghost small danger" onClick={() => remove(p)}>Hapus</button></td></tr>
                ))}</tbody>
              </table></div>
            </>
          )}
          {tab.t === 'form' && <ProductForm key={tab.product?.id ?? 'new'} product={tab.product} onSaved={saved} onCancel={() => setTab({ t: 'products' })} />}
        </div>
      </div></div>
    </div>
  )
}
