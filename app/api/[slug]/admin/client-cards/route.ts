import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profileId = req.nextUrl.searchParams.get('profileId')
  if (!profileId) return NextResponse.json({ error: 'profileId requis' }, { status: 400 })

  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  // Récupère toutes les offres actives + les cartes existantes du client en parallèle
  const [offersRes, cardsRes] = await Promise.all([
    db.from('offers').select('id, title, required_points').eq('shop_id', shop.id).eq('is_active', true),
    db.from('loyalty_cards').select('offer_id, current_points, completed_count').eq('shop_id', shop.id).eq('profile_id', profileId),
  ])

  const offers = offersRes.data || []
  const cards = cardsRes.data || []
  const cardMap = Object.fromEntries(cards.map(c => [c.offer_id, c]))

  // Merge : toutes les offres avec leurs points (0 si pas encore de carte)
  const result = offers.map(offer => ({
    offer_id: offer.id,
    title: offer.title,
    required_points: offer.required_points,
    current_points: cardMap[offer.id]?.current_points ?? 0,
    completed_count: cardMap[offer.id]?.completed_count ?? 0,
  }))

  return NextResponse.json({ cards: result })
}
