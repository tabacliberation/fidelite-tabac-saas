import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sendEmailToBuraliste } from '@/lib/email'

const COOKIE_NAME = 'superadmin_session'
const COOKIE_VALUE = 'tabacfrance_superadmin_2026'

async function isAuth() {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE
}

export async function POST(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject, message } = await req.json()
  if (!to || !subject || !message) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  await sendEmailToBuraliste(to, subject, message)
  return NextResponse.json({ ok: true })
}
