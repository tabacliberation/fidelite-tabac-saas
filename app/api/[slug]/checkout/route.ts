import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await req.json().catch(() => ({}))
    const { plan } = body

    const flexId = process.env.STRIPE_PRICE_FLEX_ID
    const engId = process.env.STRIPE_PRICE_ENGAGEMENT_ID
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe non configuré (clé manquante)' }, { status: 500 })
    }

    const priceId = plan === 'flex' ? flexId : plan === 'engagement' ? engId : null
    if (!priceId) {
      return NextResponse.json({ error: `Plan invalide ou prix manquant: "${plan}"` }, { status: 400 })
    }

    const stripe = new Stripe(secretKey)
    const db = supabaseAdmin()
    const { data: shop } = await db.from('shops').select('id, name, admin_email').eq('slug', slug).single()
    if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: shop.admin_email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { slug, shop_id: shop.id, plan },
      success_url: `${baseUrl}/${slug}/admin?subscribed=1`,
      cancel_url:  `${baseUrl}/${slug}/admin/abonnement?canceled=1`,
      subscription_data: {
        metadata: { slug, shop_id: shop.id, plan },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
