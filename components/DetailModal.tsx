'use client'
import { useEffect, useRef, useState } from 'react'
import type { Product } from '@/lib/types'
import { STORE, rupiah, waLink } from '@/lib/store'
import { Icon } from './Icon'
import { SafeImg } from './SafeImg'
import { useStore } from './StoreProvider'
import { useDialogFocus } from './useDialogFocus'

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function DetailModal() {
  const { products, detailId, closeDetail } = useStore()
  const root = useRef<HTMLDivElement>(null)
  const p = products.find((x) => x.id === detailId) ?? null
  useDialogFocus(p !== null, '.close', root)
  return (
    <div ref={root} className={'modal-backdrop' + (p ? ' show' : '')} id="detailModal" onClick={(e) => { if (e.target === e.currentTarget) closeDetail() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="detailTitle">
        <button className="close" aria-label="Tutup" onClick={closeDetail}><Icon name="x" /></button>
        <div id="detailContent">{p && <Detail key={p.id} p={p} />}</div>
      </div>
    </div>
  )
}

function Detail({ p }: { p: Product }) {
  const { addToCart, closeDetail } = useStore()
  const [qty, setQty] = useState(1)
  const [preview, setPreview] = useState<string | null>(null)
  const out = p.stock <= 0
  const modelSrc = preview ?? (p.model || null)

  useEffect(() => { if (modelSrc) void import('@google/model-viewer') }, [modelSrc])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const wa = waLink(`Halo ${STORE.name}, saya tertarik dengan ${p.name} (${rupiah(p.price)}). Apakah masih tersedia?`)
  return (
    <>
      <div className="crumb">{p.category} / {p.sub}</div>
      <div className="detail-grid">
        <div>
          {modelSrc
            ? <model-viewer className="viewer" src={modelSrc} camera-controls auto-rotate={!reduced()} shadow-intensity="1" alt={p.name} />
            : <SafeImg className={'detail-photo' + (p.cutout ? ' cut' : '')} src={p.image} alt={p.name} />}
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="modelFile">Pratinjau model 3D (.glb / .gltf), opsional</label>
            <input id="modelFile" type="file" accept=".glb,.gltf" onChange={(e) => {
              const f = e.target.files?.[0]
              if (f && /\.(glb|gltf)$/i.test(f.name)) setPreview(URL.createObjectURL(f))
            }} />
            <small className="muted">File hanya dipratinjau pada sesi browser ini.</small>
          </div>
        </div>
        <div className="detail-copy">
          <h2 id="detailTitle">{p.name}</h2>
          <div className="price big">{rupiah(p.price)}</div>
          <p>{p.desc}</p>
          <dl className="specs">
            <div><dt>Spesifikasi</dt><dd>{p.spec}</dd></div>
            <div><dt>Subkategori</dt><dd>{p.sub}</dd></div>
            <div><dt>Stok</dt><dd>{out ? 'Habis' : `${p.stock} unit`}</dd></div>
          </dl>
          <div className="quantity">
            <span>Jumlah</span>
            <button aria-label="Kurangi jumlah" onClick={() => setQty((q) => Math.max(1, q - 1))}><Icon name="minus" /></button>
            <b id="detailQty" className="mono">{qty}</b>
            <button aria-label="Tambah jumlah" onClick={() => setQty((q) => Math.min(p.stock, q + 1))}><Icon name="plus" /></button>
          </div>
          <button className="btn primary block" disabled={out} onClick={() => { addToCart(p.id, qty); closeDetail() }}>Tambahkan ke keranjang</button>
          <a className="btn ghost block" style={{ marginTop: 8 }} href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp-logo" fill /> Tanya via WhatsApp</a>
        </div>
      </div>
    </>
  )
}
