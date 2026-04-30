import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { profileId, offerId, action, pin, count = 1 } = await req.json()

  if (!profileId || !offerId || !pin) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  // Vérifier si le client est bloqué
  const { data: profile } = await db
    .from('profiles')
    .select('pin_attempts, pin_locked')
    .eq('id', profileId)
    .eq('shop_id', shop.id)
    .single()

  if (profile?.pin_locked) {
    return NextResponse.json({ error: 'Compte bloqué — contactez le buraliste', locked: true }, { status: 403 })
  }

  // Vérifier le PIN
  const { data: settings } = await db.from('admin_settings').select('pin_code').eq('shop_id', shop.id).single()

  if (!settings || settings.pin_code !== pin) {
    const attempts = (profile?.pin_attempts ?? 0) + 1
    const locked = attempts >= 3
    await db.from('profiles').update({ pin_attempts: attempts, pin_locked: locked }).eq('id', profileId)
    const msg = locked
      ? 'Compte bloqué après 3 erreurs — contactez le buraliste'
      : `Code PIN incorrect (${attempts}/3)`
    return NextResponse.json({ error: msg, locked, attempts }, { status: 403 })
  }

  // PIN correct → reset tentatives
  await db.from('profiles').update({ pin_attempts: 0, pin_locked: false }).eq('id', profileId)

  // Récupérer l'offre
  const { data: offer } = await db.from('offers').select('required_points').eq('id', offerId).eq('shop_id', shop.id).single()
  if (!offer) return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 })

  // Récupérer ou créer la carte
  let { data: card } = await db
    .from('loyalty_cards')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('profile_id', profileId)
    .eq('offer_id', offerId)
    .single()

  if (!card) {
    const { data: newCard } = await db
      .from('loyalty_cards')
      .insert({ shop_id: shop.id, profile_id: profileId, offer_id: offerId, current_points: 0, completed_count: 0 })
      .select()
      .single()
    card = newCard
  }

  if (!card) return NextResponse.json({ error: 'Erreur carte' }, { status: 500 })

  let newPoints = card.current_points
  let newCompleted = card.completed_count

  if (action === 'add') {
    const n = Math.max(1, Number(count))
    const total = newPoints + n
    newCompleted += Math.floor(total / offer.required_points)
    newPoints = total % offer.required_points
  } else {
    newPoints = Math.max(0, newPoints - 1)
  }

  await db
    .from('loyalty_cards')
    .update({ current_points: newPoints, completed_count: newCompleted, last_updated: new Date().toISOString() })
    .eq('id', card.id)

  return NextResponse.json({ success: true, current_points: newPoints, completed_count: newCompleted })
}
