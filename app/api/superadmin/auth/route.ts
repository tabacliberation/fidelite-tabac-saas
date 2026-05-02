import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'superadmin_session'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const validEmail = process.env.SUPERADMIN_EMAIL
  const validPassword = process.env.SUPERADMIN_PASSWORD
  const cookieValue = process.env.SUPERADMIN_COOKIE_SECRET ?? 'tabacfrance_superadmin_2026'

  if (!validEmail || !validPassword) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (email === validEmail && password === validPassword) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
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
