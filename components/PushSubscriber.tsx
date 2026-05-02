'use client'

import { useEffect } from 'react'

export default function PushSubscriber({ slug, profileId }: { slug: string; profileId: string }) {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'denied') return

    const alreadyKey = `push_subscribed_${slug}_${profileId}`
    if (localStorage.getItem(alreadyKey)) return

    const run = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const existing = await reg.pushManager.getSubscription()
        const subscription = existing ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })

        await fetch(`/api/${slug}/push-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, subscription }),
        })

        localStorage.setItem(alreadyKey, '1')
      } catch {
        // Silencieux — pas bloquant
      }
    }

    run()
  }, [slug, profileId])

  return null
}
