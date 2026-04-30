import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = supabaseAdmin()
  const { data: shop } = await db.from('shops').select('id, name, address, phone, hours, hero_image').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  const { data: settings } = await db.from('admin_settings').select('pin_code, shop_name').eq('shop_id', shop.id).single()

  return NextResponse.json({
    shopName: settings?.shop_name || shop.name,
    pinCode: settings?.pin_code || '1234',
    address: shop.address || '',
    phone: shop.phone || '',
    hours: shop.hours || null,
    heroImage: shop.hero_image || null,
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { shopName, pinCode, address, phone, hours, heroImage } = await req.json()
  const db = supabaseAdmin()

  const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  await Promise.all([
    db.from('shops').update({ name: shopName, address: address || null, phone: phone || null, hours: hours || null, hero_image: heroImage ?? null }).eq('id', shop.id),
    db.from('admin_settings').upsert({ shop_id: shop.id, pin_code: pinCode, shop_name: shopName, updated_at: new Date().toISOString() }, { onConflict: 'shop_id' }),
  ])

  return NextResponse.json({ success: true })
}
