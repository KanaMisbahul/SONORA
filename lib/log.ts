/* Log kejadian keamanan sebagai satu baris JSON (terbaca di Vercel Logs). Jangan pernah mencatat password atau token. */
export function audit(event: string, data: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ t: new Date().toISOString(), event, ...data }))
}
