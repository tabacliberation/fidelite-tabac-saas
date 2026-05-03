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
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

  // Clients inactifs depuis 30j (aucune carte mise à jour depuis 30j)
  const { data: inactiveCards } = await db
    .from('loyalty_cards')
    .select('profile_id, shop_id')
    .lt('updated_at', thirtyDaysAgo)

  if (!inactiveCards?.length) {
    return NextResponse.json({ success: true, reengaged: 0, message: 'Aucun client inactif' })
  }

  // Dédupliquer par profile_id
  const seen = new Set<string>()
  const targets = inactiveCards.filter(c => {
    if (seen.has(c.profile_id)) return false
    seen.add(c.profile_id)
    return true
  })

  let notifsSaved = 0
  let pushSent = 0

  for (const target of targets) {
    const { data: profile } = await db
      .from('profiles')
      .select('first_name')
      .eq('id', target.profile_id)
      .single()

    const { data: shop } = await db
      .from('shops')
      .select('slug')
      .eq('id', target.shop_id)
      .single()

    if (!profile || !shop) continue

    const title = `👋 ${profile.first_name}, on pense à vous !`
    const body = `Ça fait un moment qu'on ne vous a pas vu. Revenez valider vos achats !`
    const url = `/${shop.slug}/dashboard`

    await db.from('client_notifications').insert({
      shop_id: target.shop_id,
      profile_id: target.profile_id,
      title,
      body,
      url,
    })
    notifsSaved++

    const { data: subs } = await db
      .from('push_subscriptions')
      .select('subscription')
      .eq('profile_id', target.profile_id)

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

  return NextResponse.json({ success: true, reengaged: targets.length, notifsSaved, pushSent })
}
