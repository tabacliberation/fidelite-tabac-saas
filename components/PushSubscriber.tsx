'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}

export default function PushSubscriber({ slug, profileId }: { slug: string; profileId: string }) {
  const [showBanner, setShowBanner] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'granted') {
      // Déjà autorisé — re-sauvegarder l'abonnement silencieusement
      saveSubscription()
      return
    }
    if (Notification.permission === 'denied') return
    // 'default' → proposer le bouton
    setShowBanner(true)
  }, [slug, profileId]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const existing = await reg.pushManager.getSubscription()
      const subscription = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const res = await fetch(`/api/${slug}/push-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, subscription }),
      })
      const data = await res.json()
      if (!res.ok) alert('Erreur push: ' + JSON.stringify(data))
    } catch (e) {
      alert('Erreur subscription: ' + String(e))
    }
  }

  const handleEnable = async () => {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      await saveSubscription()
      setDone(true)
      setShowBanner(false)
    } else {
      setShowBanner(false)
    }
  }

  if (!showBanner || done) return null

  return (
    <div className="mx-5 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)' }}>
      <Bell className="w-5 h-5 shrink-0" style={{ color: '#22d3ee' }} />
      <p className="flex-1 text-xs text-slate-300">
        Activez les notifications pour recevoir vos promos
      </p>
      <button
        onClick={handleEnable}
        className="text-xs font-black px-3 py-1.5 rounded-xl shrink-0"
        style={{ background: 'rgba(34,211,238,0.2)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)' }}
      >
        Activer
      </button>
    </div>
  )
}
