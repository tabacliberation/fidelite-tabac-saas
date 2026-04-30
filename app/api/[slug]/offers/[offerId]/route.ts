import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; offerId: string }> }
) {
  const { slug, offerId } = await params
  const db = supabaseAdmin()

  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const { data: offer } = await db
    .from('offers')
    .select('*')
    .eq('id', offerId)
    .eq('shop_id', shop.id)
    .single()

  if (!offer) return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 })

  return NextResponse.json(offer)
}
