import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { firstName, lastName, phone, birthDate } = await req.json()

  if (!firstName || !lastName || !phone) {
    return NextResponse.json({ error: 'Prénom, nom et téléphone obligatoires' }, { status: 400 })
  }

  const db = supabaseAdmin()

  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const { data: existing } = await db
    .from('profiles')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('phone', phone)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Ce numéro est déjà inscrit. Utilisez la reconnexion.' }, { status: 409 })
  }

  const { data: profile, error } = await db
    .from('profiles')
    .insert({
      shop_id: shop.id,
      first_name: firstName,
      last_name: lastName,
      phone,
      birth_date: birthDate || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })

  return NextResponse.json({ profile })
}
