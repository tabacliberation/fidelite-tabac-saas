import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { sendNewShopNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { shopName, slug, address, phone, adminEmail, adminPassword, plan } = await req.json()

  if (!shopName || !slug || !address || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  if (adminPassword.length < 6) {
    return NextResponse.json({ error: 'Mot de passe trop court (6 caractères minimum)' }, { status: 400 })
  }

  const db = supabaseAdmin()

  // Vérifier que le slug est disponible
  const { data: existing } = await db.from('shops').select('id').eq('slug', slug).single()
  if (existing) {
    return NextResponse.json({ error: 'Cet identifiant est déjà pris, choisissez-en un autre.' }, { status: 409 })
  }

  // Vérifier que l'email n'est pas déjà utilisé
  const { data: existingEmail } = await db.from('shops').select('id').eq('admin_email', adminEmail).single()
  if (existingEmail) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10)

  // Créer le shop
  const { data: shop, error: shopError } = await db
    .from('shops')
    .insert({
      name: shopName,
      slug,
      address,
      phone: phone || null,
      admin_email: adminEmail,
      admin_password_hash: passwordHash,
      plan: plan === 'flex' ? 'flex' : 'engagement',
    })
    .select()
    .single()

  if (shopError) {
    return NextResponse.json({ error: 'Erreur lors de la création du shop.' }, { status: 500 })
  }

  // Créer les admin_settings par défaut
  await db.from('admin_settings').insert({
    shop_id: shop.id,
    pin_code: '1234',
    shop_name: shopName,
  })

  // Notif email admin
  sendNewShopNotification({
    name: shopName,
    slug: shop.slug,
    adminEmail: adminEmail,
    plan: plan === 'flex' ? 'Flex (19,90€/mois)' : 'Engagement (14,90€/mois)',
  }).catch(() => {})

  return NextResponse.json({ success: true, slug: shop.slug })
}
