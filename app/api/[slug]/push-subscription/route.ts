import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { profileId, subscription } = await req.json()
    if (!profileId || !subscription?.endpoint) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
    if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

    const { error: upsertError } = await db.from('push_subscriptions').upsert({
      shop_id: shop.id,
      profile_id: profileId,
      endpoint: subscription.endpoint,
      subscription,
    }, { onConflict: 'endpoint' })

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message, code: upsertError.code }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
