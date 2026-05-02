'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, Phone, Calendar, LogOut, Bell, BellOff } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}

export default function ProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('unsupported')
  const [pushLoading, setPushLoading] = useState(false)
  const [pushError, setPushError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(`profile_${slug}`)
    if (!stored) { router.replace(`/${slug}/register`); return }
    setProfile(JSON.parse(stored))
    setLoading(false)

    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPushStatus(Notification.permission as 'default' | 'granted' | 'denied')
    }
  }, [slug, router])

  const handleEnablePush = async () => {
    if (!profile) return

    // Détecter Brave qui bloque requestPermission silencieusement
    const isBrave = (navigator as any).brave && await (navigator as any).brave.isBrave().catch(() => false)
    if (isBrave) {
      setPushError('Brave bloque les notifications. Ouvrez cette page dans Chrome.')
      return
    }

    setPushLoading(true)
    setPushError('')
    try {
      // Timeout 10s si le navigateur bloque la popup silencieusement
      const permission = await Promise.race([
        Notification.requestPermission(),
        new Promise<NotificationPermission>((_, reject) =>
          setTimeout(() => reject(new Error('Le navigateur bloque la demande. Essayez Chrome.')), 10000)
        ),
      ])
      if (permission !== 'granted') {
        setPushStatus('denied')
        setPushLoading(false)
        return
      }
      setPushStatus('granted')
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) throw new Error('Clé VAPID manquante')
      const existing = await reg.pushManager.getSubscription()
      const subscription = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const res = await fetch(`/api/${slug}/push-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id, subscription }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(JSON.stringify(d))
      }
    } catch (e) {
      setPushError(String(e))
    }
    setPushLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem(`profile_${slug}`)
    router.replace(`/${slug}`)
  }

  return (
    <div className="min-h-screen neon-grid pb-24" style={{ background: '#06061a' }}>
      <div className="px-5 pb-5 page-top-pad" style={{ background: 'rgba(10,12,35,0.9)', borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
        <h1 className="text-xl font-black text-white">
          Mon <span style={{ color: '#22d3ee', textShadow: '0 0 8px #22d3ee' }}>Profil</span>
        </h1>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {loading ? (
          <div className="rounded-2xl p-5 animate-pulse space-y-3"
            style={{ background: 'rgba(10,12,35,0.8)', border: '1px solid rgba(34,211,238,0.1)' }}
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 rounded" style={{ background: 'rgba(34,211,238,0.07)' }} />
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: 'rgba(10,12,35,0.85)', border: '1px solid rgba(34,211,238,0.25)', boxShadow: '0 0 20px rgba(34,211,238,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', boxShadow: '0 0 12px rgba(34,211,238,0.15)' }}
                >
                  <User className="w-6 h-6" style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 4px #22d3ee)' }} />
                </div>
                <div>
                  <p className="font-bold text-white">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-xs" style={{ color: '#22d3ee' }}>Membre fidélité</p>
                </div>
              </div>

              <div className="space-y-3 pt-4" style={{ borderTop: '1px solid rgba(34,211,238,0.1)' }}>
                <div className="flex items-center gap-3 text-sm" style={{ color: '#cbd5e1' }}>
                  <Phone className="w-4 h-4" style={{ color: '#475569' }} />
                  {profile?.phone}
                </div>
                {profile?.birth_date && (
                  <div className="flex items-center gap-3 text-sm" style={{ color: '#cbd5e1' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#475569' }} />
                    {new Date(profile.birth_date).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            {pushStatus !== 'unsupported' && (
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(10,12,35,0.85)', border: '1px solid rgba(217,70,239,0.25)', boxShadow: '0 0 20px rgba(217,70,239,0.06)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {pushStatus === 'denied'
                      ? <BellOff className="w-5 h-5" style={{ color: '#f59e0b' }} />
                      : <Bell className="w-5 h-5" style={{ color: '#d946ef', filter: 'drop-shadow(0 0 4px #d946ef)' }} />
                    }
                    <div>
                      <p className="text-sm font-medium text-white">Notifications</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>Promos &amp; récompenses</p>
                    </div>
                  </div>
                  {pushStatus === 'granted' ? (
                    <span className="text-xs px-3 py-1 rounded-full font-bold"
                      style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}
                    >
                      Activées ✓
                    </span>
                  ) : pushStatus === 'denied' ? (
                    <span className="text-xs px-3 py-1 rounded-full font-bold"
                      style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
                    >
                      Bloquées
                    </span>
                  ) : (
                    <button
                      onClick={handleEnablePush}
                      disabled={pushLoading}
                      className="text-xs font-bold px-3 py-1 rounded-full transition-all"
                      style={{ color: '#d946ef', background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.4)', opacity: pushLoading ? 0.6 : 1 }}
                    >
                      {pushLoading ? '...' : 'Activer'}
                    </button>
                  )}
                </div>
                {pushStatus === 'denied' && (
                  <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>
                    Allez dans Paramètres de votre navigateur → Paramètres du site → Notifications → autorisez ce site
                  </p>
                )}
                {pushError && (
                  <p className="text-xs mt-2 break-all" style={{ color: '#f87171' }}>{pushError}</p>
                )}
              </div>
            )}

            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium transition-all"
              style={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.04)' }}
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </>
        )}
      </div>
    </div>
  )
}
