import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
  const { slug } = await params
  const db = supabaseAdmin()

  const { data: shop } = await db
    .from('shops')
    .select('subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id, admin_email')
    .eq('slug', slug)
    .single()

  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  let planName: string | null = null
  let currentPeriodEnd: string | null = null
  let cancelAtPeriodEnd = false
  let portalUrl: string | null = null

  if (shop.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(shop.stripe_subscription_id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = sub as any
      const priceId = sub.items.data[0]?.price.id
      const flexId = process.env.STRIPE_PRICE_FLEX_ID
      const engId = process.env.STRIPE_PRICE_ENGAGEMENT_ID
      planName = priceId === flexId ? 'flex' : priceId === engId ? 'engagement' : null
      if (s.current_period_end) currentPeriodEnd = new Date(s.current_period_end * 1000).toISOString()
      cancelAtPeriodEnd = s.cancel_at_period_end ?? false
    } catch {
      // Stripe lookup failed, continue without plan detail
    }
  }

  if (shop.stripe_customer_id) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tabacfrance.fr'
      const session = await stripe.billingPortal.sessions.create({
        customer: shop.stripe_customer_id,
        return_url: `${baseUrl}/${slug}/admin/abonnement`,
      })
      portalUrl = session.url
    } catch {
      // Portal not available
    }
  }

  return NextResponse.json({
    status: shop.subscription_status,
    trialEndsAt: shop.trial_ends_at,
    planName,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    portalUrl,
  })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
