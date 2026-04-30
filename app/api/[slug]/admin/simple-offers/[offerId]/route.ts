import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string; offerId: string }> }) {
  const { slug, offerId } = await params
  const body = await req.json()
  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const update: Record<string, unknown> = {}
  if (body.title !== undefined) update.title = body.title
  if (body.description !== undefined) update.description = body.description || null
  if (body.reward !== undefined) update.reward = body.reward || null
  if (body.is_active !== undefined) update.is_active = body.is_active
  if (body.icon !== undefined) update.icon = body.icon
  if (body.image_url !== undefined) update.image_url = body.image_url || null

  const { error } = await db.from('simple_offers').update(update).eq('id', offerId).eq('shop_id', shop.id)
  if (error) return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string; offerId: string }> }) {
  const { slug, offerId } = await params
  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  await db.from('simple_offers').delete().eq('id', offerId).eq('shop_id', shop.id)
  return NextResponse.json({ success: true })
}
