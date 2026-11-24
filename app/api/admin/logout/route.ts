import { endSession } from '@/lib/auth'
import { json, sameOrigin } from '@/lib/guard'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Origin tidak valid.' }, 403)
  await endSession()
  return json({ ok: true })
}
