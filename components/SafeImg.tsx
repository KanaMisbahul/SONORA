'use client'
import { useEffect, useRef } from 'react'
import { FALLBACK_IMG } from '@/lib/store'

/* <img> dengan fallback saat gagal dimuat, dan kelas "ok" (fade-in) saat selesai.
   Gambar bisa selesai dimuat sebelum hidrasi, jadi status dicek lagi lewat ref. */
type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string }

export function SafeImg({ src, className = '', ...rest }: Props) {
  const ref = useRef<HTMLImageElement>(null)
  const mark = (el: HTMLImageElement) => el.classList.add('ok')
  useEffect(() => {
    const el = ref.current
    if (!el || !el.complete) return
    if (el.naturalWidth) mark(el)
    else { el.src = FALLBACK_IMG; mark(el) }
  }, [])
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      {...rest}
      src={src || FALLBACK_IMG}
      className={className}
      onLoad={(e) => mark(e.currentTarget)}
      onError={(e) => {
        const el = e.currentTarget
        if (el.src !== FALLBACK_IMG) { el.src = FALLBACK_IMG }
        mark(el)
      }}
    />
  )
}
