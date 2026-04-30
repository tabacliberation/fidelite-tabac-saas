import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profileId = req.nextUrl.searchParams.get('profile_id')
  if (!profileId) return NextResponse.json([], { status: 200 })

  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json([], { status: 200 })

  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const { data } = await db
    .from('client_notifications')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('profile_id', profileId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { profile_id } = await req.json()
  if (!profile_id) return NextResponse.json({ ok: true })

  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ ok: true })

  await db.from('client_notifications').update({ read: true }).eq('shop_id', shop.id).eq('profile_id', profile_id).eq('read', false)
  return NextResponse.json({ ok: true })
}
