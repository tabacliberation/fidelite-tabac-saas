import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  const db = supabaseAdmin()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const slug = session.metadata?.slug
    if (!slug) return NextResponse.json({ ok: true })

    await db.from('shops').update({
      subscription_status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
    }).eq('slug', slug)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const slug = sub.metadata?.slug
    if (!slug) return NextResponse.json({ ok: true })

    await db.from('shops').update({ subscription_status: 'canceled' }).eq('slug', slug)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string
    await db.from('shops').update({ subscription_status: 'past_due' }).eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ ok: true })
}
