import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_IDS: Record<string, string> = {
  flex:       process.env.STRIPE_PRICE_FLEX_ID!,
  engagement: process.env.STRIPE_PRICE_ENGAGEMENT_ID!,
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { plan } = await req.json()

  if (!PRICE_IDS[plan]) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

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
    cancel_url:  `${baseUrl}/${slug}/abonnement?canceled=1`,
    subscription_data: {
      metadata: { slug, shop_id: shop.id, plan },
    },
  })

  return NextResponse.json({ url: session.url })
}
