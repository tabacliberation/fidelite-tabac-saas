import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const { data: offers } = await db.from('simple_offers').select('*').eq('shop_id', shop.id).order('created_at')
  return NextResponse.json({ offers: offers || [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const body = await req.json()
  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const { data, error } = await db.from('simple_offers').insert({
    shop_id: shop.id,
    title: body.title,
    description: body.description || null,
    reward: body.reward || null,
    icon: body.icon || 'gift',
    image_url: body.image_url || null,
  }).select().single()

  if (error) return NextResponse.json({ error: 'Erreur création offre' }, { status: 500 })
  return NextResponse.json({ offer: data })
}
