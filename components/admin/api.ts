export type ApiResult<T = unknown> = { ok: boolean; status: number; data: T & { error?: string; fields?: Record<string, string> } }

/* Fetch same-origin ke API admin. Browser otomatis menyertakan cookie sesi dan header Origin. */
export async function api<T = unknown>(method: string, url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: body instanceof FormData || body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: { error: 'Tidak bisa terhubung ke server.' } as ApiResult<T>['data'] }
  }
}
