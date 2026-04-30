import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { email, password } = await req.json()

  const db = supabaseAdmin()

  const { data: shop } = await db
    .from('shops')
    .select('id, name, admin_email, admin_password_hash')
    .eq('slug', slug)
    .single()

  if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

  if (shop.admin_email !== email) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, shop.admin_password_hash)
  if (!valid) return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })

  return NextResponse.json({ success: true, shopName: shop.name })
}
