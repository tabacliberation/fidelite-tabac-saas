import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { profile_id, prize } = await req.json()

  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  await db.from('wheel_wins').insert({ shop_id: shop.id, profile_id: profile_id || null, prize, collected: false })

  return NextResponse.json({ ok: true })
}
