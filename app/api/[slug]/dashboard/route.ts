import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profileId = req.nextUrl.searchParams.get('profileId')

  if (!profileId) return NextResponse.json({ error: 'profileId requis' }, { status: 400 })

  const db = supabaseAdmin()

  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  // Toutes les offres actives + cartes existantes du client + état du profil en parallèle
  const [offersRes, cardsRes, profileRes] = await Promise.all([
    db.from('offers').select('id, title, description, required_points, reward, icon, image_url, expires_at').eq('shop_id', shop.id).eq('is_active', true),
    db.from('loyalty_cards').select('offer_id, current_points, completed_count').eq('shop_id', shop.id).eq('profile_id', profileId),
    db.from('profiles').select('pin_locked').eq('id', profileId).single(),
  ])

  const offers = offersRes.data || []
  const cardsRaw = cardsRes.data || []
  const locked = profileRes.data?.pin_locked ?? false
  const cardMap = Object.fromEntries(cardsRaw.map(c => [c.offer_id, c]))

  // Merge : toutes les offres avec leur progression (0 si pas encore de carte)
  const cards = offers.map(offer => ({
    id: `${offer.id}_${profileId}`,
    offer_id: offer.id,
    current_points: cardMap[offer.id]?.current_points ?? 0,
    completed_count: cardMap[offer.id]?.completed_count ?? 0,
    offer: {
      id: offer.id,
      title: offer.title,
      description: offer.description,
      required_points: offer.required_points,
      reward: offer.reward,
      icon: offer.icon,
      image_url: offer.image_url,
      expires_at: offer.expires_at ?? null,
    },
  }))

  return NextResponse.json({ cards, locked })
}
