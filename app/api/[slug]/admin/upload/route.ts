import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const BUCKET = 'shop-images'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = supabaseAdmin()

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  // Create bucket if it doesn't exist
  const { data: buckets } = await db.storage.listBuckets()
  if (!buckets?.find(b => b.name === BUCKET)) {
    const { error: bucketError } = await db.storage.createBucket(BUCKET, { public: true })
    if (bucketError) return NextResponse.json({ error: `Bucket: ${bucketError.message}` }, { status: 500 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${slug}/hero.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path)
  const urlWithBust = `${publicUrl}?t=${Date.now()}`

  const { error: dbError } = await db.from('shops').update({ hero_image: urlWithBust }).eq('slug', slug)
  if (dbError) return NextResponse.json({ error: `DB: ${dbError.message}` }, { status: 500 })

  return NextResponse.json({ url: urlWithBust })
}
