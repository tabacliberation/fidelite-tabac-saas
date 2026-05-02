import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import webpush from 'web-push'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { title, body, image, profile_id } = await req.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 })
    }

    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL ?? 'contact@tabacfrance.fr'}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    const db = supabaseAdmin()
    const { data: shop } = await db.from('shops').select('id').eq('slug', slug).single()
    if (!shop) return NextResponse.json({ error: 'Shop introuvable' }, { status: 404 })

    // Cibler un seul client ou tous
    let profileQuery = db.from('profiles').select('id').eq('shop_id', shop.id)
    if (profile_id) profileQuery = profileQuery.eq('id', profile_id)
    const { data: profiles } = await profileQuery
    if (!profiles?.length) return NextResponse.json({ success: true, sent: 0 })

    // Sauvegarder en base (cloche)
    const notifRows = profiles.map(p => ({
      shop_id: shop.id,
      profile_id: p.id,
      title,
      body,
      image: image || null,
      url: `/${slug}/notifications`,
    }))
    await db.from('client_notifications').insert(notifRows)

    // Envoyer push web à chaque appareil abonné
    const profileIds = profiles.map(p => p.id)
    let subsQuery = db.from('push_subscriptions').select('subscription').eq('shop_id', shop.id)
    if (profile_id) {
      subsQuery = subsQuery.eq('profile_id', profile_id)
    } else {
      subsQuery = subsQuery.in('profile_id', profileIds)
    }
    const { data: subs } = await subsQuery

    let pushed = 0
    if (subs?.length) {
      const payload = JSON.stringify({
        title,
        body,
        icon: '/icon-192.svg',
        url: `/${slug}/notifications`,
      })
      await Promise.allSettled(
        subs.map(async (row) => {
          try {
            await webpush.sendNotification(row.subscription, payload)
            pushed++
          } catch {
            // Subscription expirée ou invalide — on ignore
          }
        })
      )
    }

    return NextResponse.json({ success: true, sent: profiles.length, pushed })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
