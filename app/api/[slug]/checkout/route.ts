import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_IDS: Record<string, string> = {
  flex:       process.env.STRIPE_PRICE_FLEX_ID!,
  engagement: process.env.STRIPE_PRICE_ENGAGEMENT_ID!,
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await req.json().catch(() => ({}))
    const { plan } = body

    if (!PRICE_IDS[plan]) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe non configuré (clé manquante)' }, { status: 500 })
    }
    if (!PRICE_IDS[plan]) {
      return NextResponse.json({ error: `Prix Stripe manquant pour le plan "${plan}"` }, { status: 500 })
    }

    const db = supabaseAdmin()
    const { data: shop } = await db.from('shops').select('id, name, admin_email').eq('slug', slug).single()
    if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: shop.admin_email,
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
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
