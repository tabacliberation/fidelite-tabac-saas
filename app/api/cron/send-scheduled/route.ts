import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import webpush from 'web-push'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? 'contact@tabacfrance.fr'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const db = supabaseAdmin()

  // Notifs programmées dont l'heure est passée et pas encore envoyées
  const { data: pending } = await db
    .from('scheduled_pushes')
    .select('*')
    .is('sent_at', null)
    .lte('scheduled_at', new Date().toISOString())

  if (!pending?.length) {
    return NextResponse.json({ success: true, sent: 0 })
  }

  let totalPushed = 0

  for (const notif of pending) {
    // Récupérer le slug du shop
    const { data: shop } = await db.from('shops').select('slug').eq('id', notif.shop_id).single()
    if (!shop) continue

    // Récupérer tous les profils du shop
    const { data: profiles } = await db
      .from('profiles')
      .select('id')
      .eq('shop_id', notif.shop_id)

    if (!profiles?.length) continue

    const profileIds = profiles.map(p => p.id)
    const url = `/${shop.slug}/notifications`

    // Sauvegarder dans client_notifications pour chaque client
    await db.from('client_notifications').insert(
      profiles.map(p => ({
        shop_id: notif.shop_id,
        profile_id: p.id,
        title: notif.title,
        body: notif.body,
        image: notif.image || null,
        url,
      }))
    )

    // Envoyer push web
    const { data: subs } = await db
      .from('push_subscriptions')
      .select('subscription')
      .eq('shop_id', notif.shop_id)
      .in('profile_id', profileIds)

    if (subs?.length) {
      const payload = JSON.stringify({ title: notif.title, body: notif.body, icon: '/icon-192.png', url })
      await Promise.allSettled(
        subs.map(async (row) => {
          try { await webpush.sendNotification(row.subscription, payload); totalPushed++ }
          catch { /* subscription expirée */ }
        })
      )
    }

    // Marquer comme envoyée
    await db.from('scheduled_pushes').update({ sent_at: new Date().toISOString() }).eq('id', notif.id)
  }

  return NextResponse.json({ success: true, processed: pending.length, pushed: totalPushed })
}
