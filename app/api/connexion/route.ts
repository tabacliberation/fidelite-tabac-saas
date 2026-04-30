import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data: shop } = await db
    .from('shops')
    .select('id, slug, admin_email, admin_password_hash')
    .eq('admin_email', email)
    .single()

  if (!shop) {
    return NextResponse.json({ error: 'Aucun compte trouvé avec cet email' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, shop.admin_password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  return NextResponse.json({ success: true, slug: shop.slug })
}
