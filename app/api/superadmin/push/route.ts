import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const COOKIE_NAME = 'superadmin_session'
const COOKIE_VALUE = 'tabacfrance_superadmin_2026'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isAuth() {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE
}

export async function POST(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const subscription = await req.json()
  await supabase.from('superadmin_push_subscriptions').insert({ subscription })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { endpoint } = await req.json()
  await supabase.from('superadmin_push_subscriptions').delete().eq('subscription->>endpoint', endpoint)
  return NextResponse.json({ ok: true })
}
