import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { title, body, image, profile_id } = await req.json()

  if (!title || !body) {
    return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  // Cibler un seul client ou tous les clients du shop
  let query = db.from('profiles').select('id').eq('shop_id', shop.id)
  if (profile_id) query = query.eq('id', profile_id)

  const { data: profiles } = await query
  if (!profiles?.length) return NextResponse.json({ success: true, sent: 0 })

  const notifRows = profiles.map(p => ({
    shop_id: shop.id,
    profile_id: p.id,
    title,
    body,
    image: image || null,
    url: `/${slug}/notifications`,
  }))

  await db.from('client_notifications').insert(notifRows)

  return NextResponse.json({ success: true, sent: profiles.length })
}
