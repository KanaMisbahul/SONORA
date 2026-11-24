import { useEffect, useRef } from 'react'

/* Saat dialog terbuka: simpan fokus lama dan fokus ke tombol tutup. Saat tertutup: kembalikan fokus. */
export function useDialogFocus(open: boolean, focusSelector: string, rootRef: React.RefObject<HTMLElement | null>) {
  const last = useRef<HTMLElement | null>(null)
  const was = useRef(false)
  useEffect(() => {
    if (open && !was.current) {
      last.current = document.activeElement as HTMLElement | null
      rootRef.current?.querySelector<HTMLElement>(focusSelector)?.focus()
    } else if (!open && was.current) {
      last.current?.focus?.()
    }
    was.current = open
  }, [open, focusSelector, rootRef])
}
