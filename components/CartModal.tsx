'use client'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { STORE, rupiah, waLink } from '@/lib/store'
import { Icon } from './Icon'
import { SafeImg } from './SafeImg'
import { useStore } from './StoreProvider'
import { useDialogFocus } from './useDialogFocus'

export function CartModal() {
  const { products, cart, cartOpen, closeCart, setQty, removeFromCart } = useStore()
  const root = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [nameErr, setNameErr] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  useDialogFocus(cartOpen, '.close', root)

  /* Harga selalu dari data server (products), bukan dari localStorage. */
  const rows = cart.flatMap((x) => { const p = products.find((z) => z.id === x.id); return p ? [{ p, qty: x.qty }] : [] })
  const total = rows.reduce((s, r) => s + r.p.price * r.qty, 0)

  function checkout() {
    const n = name.trim()
    if (!n) { setNameErr(true); nameRef.current?.focus(); return }
    let msg = `Halo ${STORE.name}, saya ${n} ingin memesan:\n\n`
    rows.forEach((r) => { msg += `- ${r.p.name} (${r.qty}x): ${rupiah(r.p.price * r.qty)}\n` })
    msg += `\nTotal: ${rupiah(total)}\nCatatan: ${note.trim() || '-'}`
    window.open(waLink(msg), '_blank', 'noopener,noreferrer')
  }

  return (
    <div ref={root} className={'modal-backdrop' + (cartOpen ? ' show' : '')} id="cartModal" onClick={(e) => { if (e.target === e.currentTarget) closeCart() }}>
      <div className="modal narrow" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
        <button className="close" aria-label="Tutup" onClick={closeCart}><Icon name="x" /></button>
        <h2 id="cartTitle">Keranjang Belanja</h2>
        <div id="cartItems">
          {!rows.length ? (
            <div className="empty"><Icon name="shopping-cart-simple" /><p>Keranjangmu masih kosong.</p>
              <Link className="btn" href="/produk" onClick={closeCart}>Mulai belanja</Link></div>
          ) : rows.map(({ p, qty }) => (
            <div className="cart-row" key={p.id}>
              <SafeImg src={p.image} alt="" />
              <div>
                <h4>{p.name}</h4>
                <small><span className="mono">{rupiah(p.price)}</span> · Stok {p.stock}</small>
                <div className="quantity" style={{ margin: '8px 0 0', gap: 8 }}>
                  <button aria-label="Kurangi jumlah" onClick={() => setQty(p.id, qty - 1)}><Icon name="minus" /></button>
                  <b className="mono">{qty}</b>
                  <button aria-label="Tambah jumlah" onClick={() => setQty(p.id, qty + 1)}><Icon name="plus" /></button>
                </div>
              </div>
              <button className="btn ghost small" onClick={() => removeFromCart(p.id)}>Hapus</button>
            </div>
          ))}
        </div>
        <div id="cartSummary">
          {rows.length > 0 && (
            <>
              <div className="cart-total"><span>Total</span><span className="mono">{rupiah(total)}</span></div>
              <div className="field">
                <label htmlFor="buyerName">Nama pemesan</label>
                <input ref={nameRef} id="buyerName" placeholder="Nama kamu" autoComplete="name" maxLength={60} aria-describedby="nameErr" aria-invalid={nameErr || undefined}
                  value={name} onChange={(e) => { setName(e.target.value); setNameErr(false) }} />
                <p className="error" id="nameErr" hidden={!nameErr}>Isi nama pemesan terlebih dahulu.</p>
              </div>
              <div className="field">
                <label htmlFor="buyerNote">Catatan pesanan (opsional)</label>
                <textarea id="buyerNote" maxLength={300} placeholder="Warna, varian, atau pertanyaan..." value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button className="btn primary block" onClick={checkout}><Icon name="whatsapp-logo" fill /> Checkout via WhatsApp</button>
              <p className="note">Pesanan dikirim lewat WhatsApp toko. Total dihitung dari harga terbaru di katalog.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
