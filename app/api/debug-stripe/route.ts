import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    flex: process.env.STRIPE_PRICE_FLEX_ID ?? 'MANQUANT',
    engagement: process.env.STRIPE_PRICE_ENGAGEMENT_ID ?? 'MANQUANT',
    key_prefix: (process.env.STRIPE_SECRET_KEY ?? '').substring(0, 12),
  })
}
