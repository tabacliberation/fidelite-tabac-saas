import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = supabaseAdmin()

  const { data: shop } = await db.from('shops').select('id, name').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const [{ count: clients }, { count: offers }] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id),
    db.from('offers').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('is_active', true),
  ])

  return NextResponse.json({ clients: clients || 0, offers: offers || 0, shopName: shop.name })
}
