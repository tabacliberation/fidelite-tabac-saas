'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

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
  const [denied, setDenied] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'granted') {
      saveSubscription()
      return
    }
    if (Notification.permission === 'denied') {
      setDenied(true)
      return
    }
    setShowBanner(true)
  }, [slug, profileId]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { setError('Clé VAPID manquante'); return }
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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError('Erreur: ' + JSON.stringify(data))
      }
    } catch (e) {
      setError(String(e))
    }
  }

  const handleEnable = async () => {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      await saveSubscription()
      setDone(true)
      setShowBanner(false)
    } else if (permission === 'denied') {
      setShowBanner(false)
      setDenied(true)
    } else {
      setShowBanner(false)
    }
  }

  if (done) return null

  if (error) return (
    <div className="mx-5 mb-4 rounded-2xl px-4 py-3"
      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }}>
      <p className="text-xs text-red-400 font-bold">Erreur notifications</p>
      <p className="text-xs text-red-300 mt-1 break-all">{error}</p>
    </div>
  )

  if (denied) return (
    <div className="mx-5 mb-4 rounded-2xl px-4 py-3 flex items-start gap-3"
      style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
      <BellOff className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
      <div>
        <p className="text-xs font-bold" style={{ color: '#f59e0b' }}>Notifications bloquées</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Allez dans Paramètres Chrome → Paramètres du site → Notifications → autorisez ce site
        </p>
      </div>
    </div>
  )

  if (!showBanner) return null

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
