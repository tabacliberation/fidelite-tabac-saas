import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const DEMO_SLUG = 'demo-tabac'
const DEMO_PASSWORD_HASH = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'

const DEMO_OFFERS = [
  {
    title: 'Café Offert',
    description: 'Achetez 5 cafés et le 6ème est offert. Valable sur tous les cafés du comptoir.',
    required_points: 6,
    reward: '1 café au comptoir',
    icon: 'coffee',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    is_active: true,
  },
  {
    title: 'Canette Offerte',
    description: 'Achetez 10 canettes et la suivante est offerte. Tous les formats.',
    required_points: 10,
    reward: '1 canette de votre choix',
    icon: 'zap',
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
    is_active: true,
  },
  {
    title: 'Sandwich Offert',
    description: 'Achetez 8 sandwichs et le suivant est offert. Valable sur tous les sandwichs du rayon.',
    required_points: 8,
    reward: '1 sandwich au choix',
    icon: 'gift',
    image_url: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80',
    is_active: true,
  },
  {
    title: 'Barre Chocolat',
    description: 'Achetez 5 barres chocolatées et la suivante est offerte. Kit-Kat, Twix, Snickers...',
    required_points: 5,
    reward: '1 barre chocolatée au choix',
    icon: 'star',
    image_url: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=80',
    is_active: true,
  },
]

export async function GET() {
  const db = supabaseAdmin()

  // Vérifier si le shop démo existe déjà
  const { data: existing } = await db
    .from('shops')
    .select('id, slug')
    .eq('slug', DEMO_SLUG)
    .maybeSingle()

  if (existing) {
    // Vérifier si les offres démo sont à jour (4 offres avec photos)
    const { data: existingOffers } = await db
      .from('offers')
      .select('id, image_url')
      .eq('shop_id', existing.id)

    const needsReset = !existingOffers?.length ||
      existingOffers.length < 4 ||
      existingOffers.some(o => !o.image_url)

    if (needsReset) {
      await db.from('offers').delete().eq('shop_id', existing.id)
      await db.from('loyalty_cards').delete().eq('shop_id', existing.id)

      const { data: newOffers } = await db
        .from('offers')
        .insert(DEMO_OFFERS.map(o => ({ ...o, shop_id: existing.id })))
        .select()

      // Re-créer un client démo avec des points
      const { data: profile } = await db
        .from('profiles')
        .select('id')
        .eq('shop_id', existing.id)
        .limit(1)
        .maybeSingle()

      if (profile && newOffers && newOffers.length >= 4) {
        await db.from('loyalty_cards').insert([
          { shop_id: existing.id, profile_id: profile.id, offer_id: newOffers[0].id, current_points: 4, completed_count: 1 },
          { shop_id: existing.id, profile_id: profile.id, offer_id: newOffers[1].id, current_points: 7, completed_count: 0 },
          { shop_id: existing.id, profile_id: profile.id, offer_id: newOffers[2].id, current_points: 3, completed_count: 0 },
          { shop_id: existing.id, profile_id: profile.id, offer_id: newOffers[3].id, current_points: 2, completed_count: 2 },
        ])
      }
    }

    return NextResponse.json({ slug: existing.slug })
  }

  // Créer le shop démo
  const { data: shop, error: shopError } = await db
    .from('shops')
    .upsert({
      name: 'Tabac de la Démo',
      slug: DEMO_SLUG,
      address: '1 Place de la République, 75011 Paris',
      phone: '01 23 45 67 89',
      admin_email: 'demo@fidelitetabac.fr',
      admin_password_hash: DEMO_PASSWORD_HASH,
      plan: 'engagement',
    }, { onConflict: 'slug' })
    .select()
    .single()

  if (shopError || !shop) {
    return NextResponse.json({ error: 'Erreur création démo', detail: shopError?.message }, { status: 500 })
  }

  const [, offersRes] = await Promise.all([
    db.from('admin_settings').upsert({ shop_id: shop.id, pin_code: '1234', shop_name: 'Tabac de la Démo' }, { onConflict: 'shop_id' }),
    db.from('offers').insert(DEMO_OFFERS.map(o => ({ ...o, shop_id: shop.id }))).select(),
    db.from('simple_offers').insert([
      { shop_id: shop.id, title: '-20% sur les recharges', description: 'Ce weekend seulement !', reward: '-20% en caisse', icon: 'tag', is_active: true },
      { shop_id: shop.id, title: 'Happy Hour 17h–19h', description: 'Boissons fraîches à moitié prix', reward: '-50% boissons fraîches', icon: 'zap', is_active: true },
    ]),
  ])

  const { data: profile } = await db.from('profiles').insert({
    shop_id: shop.id, first_name: 'Marie', last_name: 'Dupont',
    phone: '0600000001', birth_date: '1990-06-15',
  }).select().single()

  const offers = offersRes.data
  if (profile && offers && offers.length >= 4) {
    await db.from('loyalty_cards').insert([
      { shop_id: shop.id, profile_id: profile.id, offer_id: offers[0].id, current_points: 4, completed_count: 1 },
      { shop_id: shop.id, profile_id: profile.id, offer_id: offers[1].id, current_points: 7, completed_count: 0 },
      { shop_id: shop.id, profile_id: profile.id, offer_id: offers[2].id, current_points: 3, completed_count: 0 },
      { shop_id: shop.id, profile_id: profile.id, offer_id: offers[3].id, current_points: 2, completed_count: 2 },
    ])
  }

  return NextResponse.json({ slug: DEMO_SLUG })
}
