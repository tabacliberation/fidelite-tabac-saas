import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'tahardjamel22@gmail.com'
const ADMIN_PASSWORD = '40Glacialxivire!'
const COOKIE_NAME = 'superadmin_session'
const COOKIE_VALUE = 'tabacfrance_superadmin_2026'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return NextResponse.json({ ok: true })
}
