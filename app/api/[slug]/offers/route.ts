import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const db = supabaseAdmin()

    const { data: shop, error: shopErr } = await db
      .from('shops')
      .select('id')
      .eq('slug', slug)
      .single()

    if (shopErr || !shop) {
      return NextResponse.json({ offers: [] }, { status: 200 })
    }

    const { data: offers } = await db
      .from('offers')
      .select('*')
      .eq('shop_id', shop.id)
      .eq('is_active', true)
      .order('created_at')

    return NextResponse.json({ offers: offers ?? [] })
  } catch (e) {
    return NextResponse.json({ offers: [], error: String(e) }, { status: 200 })
  }
}
