import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const { data: items } = await db
    .from('scheduled_pushes')
    .select('id, title, body, scheduled_at')
    .eq('shop_id', shop.id)
    .is('sent_at', null)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')

  return NextResponse.json({ items: items ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { title, body, image, scheduled_at } = await req.json()
  if (!title || !body || !scheduled_at) {
    return NextResponse.json({ error: 'Titre, message et date requis' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const { error } = await db.from('scheduled_pushes').insert({
    shop_id: shop.id,
    title,
    body,
    image: image || null,
    scheduled_at,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const db = supabaseAdmin()
  await db.from('scheduled_pushes').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
