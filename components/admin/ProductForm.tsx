'use client'
import { useState } from 'react'
import type { Product } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'
import { api } from './api'

type Draft = Omit<Product, 'id' | 'price' | 'stock'> & { price: string; stock: string }

const toDraft = (p?: Product): Draft => ({
  name: p?.name ?? '', category: p?.category ?? 'Gitar', sub: p?.sub ?? '', price: p ? String(p.price) : '', stock: String(p?.stock ?? 0),
  tag: p?.tag ?? '', image: p?.image ?? '', cutout: p?.cutout ?? false, desc: p?.desc ?? '', spec: p?.spec ?? '', model: p?.model ?? '',
})

export function ProductForm({ product, onSaved, onCancel }: { product?: Product; onSaved: () => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(() => toDraft(product))
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErrs({}); setMsg('')
    const body = { ...d, price: Number(d.price), stock: Number(d.stock) }
    const r = await api(product ? 'PUT' : 'POST', product ? `/api/admin/products/${product.id}` : '/api/admin/products', body)
    setBusy(false)
    if (r.ok) { onSaved(); return }
    setErrs(r.data.fields ?? {})
    setMsg(r.data.error ?? 'Gagal menyimpan.')
  }

  async function upload(file: File | undefined) {
    if (!file) return
    setBusy(true); setMsg('')
    const fd = new FormData(); fd.append('file', file)
    const r = await api<{ url: string }>('POST', '/api/admin/upload', fd)
    setBusy(false)
    if (r.ok && r.data.url) { set('image', r.data.url); setErrs((x) => ({ ...x, image: '' })) }
    else setErrs((x) => ({ ...x, image: r.data.error ?? 'Gagal mengunggah.' }))
  }

  const field = (id: keyof Draft, label: string, control: React.ReactNode) => (
    <div className="field"><label htmlFor={`f_${id}`}>{label}</label>{control}{errs[id] && <p className="error" role="alert">{errs[id]}</p>}</div>
  )
  const txt = (id: 'name' | 'sub' | 'tag' | 'spec', max: number, extra?: React.InputHTMLAttributes<HTMLInputElement>) =>
    <input id={`f_${id}`} name={id} maxLength={max} value={d[id]} onChange={(e) => set(id, e.target.value)} {...extra} />

  return (
    <>
      <h2>{product ? 'Edit produk' : 'Tambah produk baru'}</h2>
      <form onSubmit={submit} autoComplete="off">
        <div className="form-grid">
          {field('name', 'Nama produk', txt('name', 80, { required: true }))}
          {field('category', 'Kategori', <select id="f_category" name="category" value={d.category} onChange={(e) => set('category', e.target.value as Draft['category'])}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>)}
          {field('sub', 'Subkategori', txt('sub', 40, { required: true }))}
          {field('price', 'Harga (Rp)', <input id="f_price" name="price" type="number" min={0} max={1000000000} step={1} required value={d.price} onChange={(e) => set('price', e.target.value)} />)}
          {field('stock', 'Stok', <input id="f_stock" name="stock" type="number" min={0} max={100000} step={1} required value={d.stock} onChange={(e) => set('stock', e.target.value)} />)}
          {field('tag', 'Label produk', txt('tag', 24, { placeholder: 'Best seller / Baru' }))}
        </div>
        {field('image', 'URL gambar produk', (
          <>
            <input id="f_image" name="image" inputMode="url" maxLength={500} value={d.image} onChange={(e) => set('image', e.target.value)} placeholder="Unggah file di bawah, atau https://... dari Blob/Unsplash" />
            <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="Unggah foto produk" onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = '' }} style={{ marginTop: 8 }} />
            <small className="muted">PNG, JPEG, atau WebP, maks 2 MB.</small>
          </>
        ))}
        <div className="field"><label><input id="f_cutout" name="cutout" type="checkbox" checked={d.cutout} onChange={(e) => set('cutout', e.target.checked)} /> Foto tanpa background (PNG/WebP transparan, tampil menggantung di Etalase)</label></div>
        {field('desc', 'Deskripsi', <textarea id="f_desc" name="desc" required maxLength={500} value={d.desc} onChange={(e) => set('desc', e.target.value)} />)}
        {field('spec', 'Spesifikasi', txt('spec', 120))}
        {field('model', 'URL model 3D (.glb / .gltf)', <input id="f_model" name="model" maxLength={500} value={d.model} onChange={(e) => set('model', e.target.value)} placeholder="https://...public.blob.vercel-storage.com/model.glb" />)}
        {msg && <p className="error" role="alert">{msg}</p>}
        <button className="btn primary" disabled={busy}>{busy ? 'Menyimpan...' : product ? 'Simpan perubahan' : 'Simpan produk'}</button>{' '}
        <button type="button" className="btn ghost" onClick={onCancel}>Batal</button>
      </form>
    </>
  )
}
