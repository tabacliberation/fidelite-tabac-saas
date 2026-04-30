import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { phone } = await req.json()

  if (!phone) return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 })

  const db = supabaseAdmin()

  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('phone', phone)
    .single()

  if (!profile) return NextResponse.json({ error: 'Numéro non trouvé. Créez votre compte d\'abord.' }, { status: 404 })

  if (profile.pin_locked) {
    return NextResponse.json({ error: 'Compte bloqué. Contactez votre buraliste.' }, { status: 403 })
  }

  return NextResponse.json({ profile })
}
