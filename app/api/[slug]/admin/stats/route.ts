import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = supabaseAdmin()

  const { data: shop } = await db.from('shops').select('id, name').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { count: totalClients },
    { count: newClientsMonth },
    { count: activeOffers },
    { count: pushSubscribers },
    { data: cards },
    { count: notifsMonth },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id),
    db.from('profiles').select('*', { count: 'exact', head: true })
      .eq('shop_id', shop.id)
      .gte('created_at', startOfMonth.toISOString()),
    db.from('offers').select('*', { count: 'exact', head: true })
      .eq('shop_id', shop.id).eq('is_active', true),
    db.from('push_subscriptions').select('*', { count: 'exact', head: true })
      .eq('shop_id', shop.id),
    db.from('loyalty_cards').select('current_points, completed_count')
      .eq('shop_id', shop.id),
    db.from('client_notifications').select('*', { count: 'exact', head: true })
      .eq('shop_id', shop.id)
      .gte('created_at', startOfMonth.toISOString()),
  ])

  const totalPoints = cards?.reduce((s, c) => s + (c.current_points ?? 0), 0) ?? 0
  const totalRewards = cards?.reduce((s, c) => s + (c.completed_count ?? 0), 0) ?? 0

  return NextResponse.json({
    shopName: shop.name,
    totalClients: totalClients ?? 0,
    newClientsMonth: newClientsMonth ?? 0,
    activeOffers: activeOffers ?? 0,
    pushSubscribers: pushSubscribers ?? 0,
    totalPoints,
    totalRewards,
    notifsMonth: notifsMonth ?? 0,
  })
}
