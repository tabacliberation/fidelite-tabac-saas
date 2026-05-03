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

  // Profils dont c'est l'anniversaire aujourd'hui (compare mois + jour uniquement)
  const { data: targets, error } = await db.rpc('get_birthday_profiles_today')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!targets?.length) {
    return NextResponse.json({ success: true, sent: 0, message: "Aucun anniversaire aujourd'hui" })
  }

  let notifsSaved = 0
  let pushSent = 0

  for (const profile of targets as { id: string; first_name: string; shop_id: string; slug: string }[]) {
    const title = `🎂 Bon anniversaire ${profile.first_name} !`
    const body = `Toute l'équipe vous souhaite un excellent anniversaire ! 🎉`
    const url = `/${profile.slug}/notifications`

    await db.from('client_notifications').insert({
      shop_id: profile.shop_id,
      profile_id: profile.id,
      title,
      body,
      url,
    })
    notifsSaved++

    const { data: subs } = await db
      .from('push_subscriptions')
      .select('subscription')
      .eq('profile_id', profile.id)

    if (subs?.length) {
      const payload = JSON.stringify({ title, body, icon: '/icon-192.png', url })
      await Promise.allSettled(
        subs.map(async (row) => {
          try { await webpush.sendNotification(row.subscription, payload); pushSent++ }
          catch { /* subscription expirée */ }
        })
      )
    }
  }

  return NextResponse.json({ success: true, birthdays: targets.length, notifsSaved, pushSent })
}
