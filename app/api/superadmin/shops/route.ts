import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const COOKIE_NAME = 'superadmin_session'
const COOKIE_VALUE = 'tabacfrance_superadmin_2026'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function isAuth() {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE
}

export async function GET() {
  if (!(await isAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: shops, error } = await supabase
    .from('shops')
    .select('id, name, slug, admin_email, subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id, created_at, plan')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ shops })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { shopId, action, days } = await req.json()
  if (!shopId || !action) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  if (action === 'extend_trial') {
    const { data: shop } = await supabase.from('shops').select('trial_ends_at').eq('id', shopId).single()
    const base = shop?.trial_ends_at ? new Date(shop.trial_ends_at) : new Date()
    if (base < new Date()) base.setTime(Date.now())
    base.setDate(base.getDate() + (days ?? 7))
    await supabase.from('shops').update({ trial_ends_at: base.toISOString(), subscription_status: 'trial' }).eq('id', shopId)
    return NextResponse.json({ ok: true })
  }

  if (action === 'suspend') {
    await supabase.from('shops').update({ subscription_status: 'canceled' }).eq('id', shopId)
    return NextResponse.json({ ok: true })
  }

  if (action === 'reactivate') {
    await supabase.from('shops').update({ subscription_status: 'trial' }).eq('id', shopId)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subscriptionId } = await req.json()
  if (!subscriptionId) return NextResponse.json({ error: 'Missing subscriptionId' }, { status: 400 })

  await stripe.subscriptions.cancel(subscriptionId)
  return NextResponse.json({ ok: true })
}
