import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const { data } = await db
    .from('wheel_wins')
    .select('*, profiles(first_name, last_name, phone)')
    .eq('shop_id', shop.id)
    .order('won_at', { ascending: false })

  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { id } = await req.json()
  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  await db.from('wheel_wins').update({ collected: true }).eq('id', id).eq('shop_id', shop.id)
  return NextResponse.json({ ok: true })
}
