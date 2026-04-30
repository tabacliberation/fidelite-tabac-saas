import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { profileId, lock } = await req.json()

  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  await db
    .from('profiles')
    .update({ pin_locked: lock, pin_attempts: 0 })
    .eq('id', profileId)
    .eq('shop_id', shop.id)

  return NextResponse.json({ success: true })
}
