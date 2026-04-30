import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function sendAdminPush(title: string, body: string, url = '/superadmin') {
  const { data: rows } = await supabase.from('superadmin_push_subscriptions').select('id, subscription')
  if (!rows?.length) return

  const payload = JSON.stringify({ title, body, url })
  const dead: string[] = []

  await Promise.allSettled(
    rows.map(async row => {
      try {
        await webpush.sendNotification(row.subscription, payload)
      } catch {
        dead.push(row.id)
      }
    })
  )

  if (dead.length) {
    await supabase.from('superadmin_push_subscriptions').delete().in('id', dead)
  }
}
