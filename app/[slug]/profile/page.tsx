'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, Phone, Calendar, LogOut, Bell } from 'lucide-react'

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
  const [diagSteps, setDiagSteps] = useState<string[]>([])
  const [diagRunning, setDiagRunning] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(`profile_${slug}`)
    if (!stored) { router.replace(`/${slug}/register`); return }
    setProfile(JSON.parse(stored))
    setLoading(false)
  }, [slug, router])

  const runDiagnostic = async () => {
    if (!profile) return
    setDiagRunning(true)
    const steps: string[] = []
    const add = (msg: string) => { steps.push(msg); setDiagSteps([...steps]) }

    add('1. Service Worker : ' + ('serviceWorker' in navigator ? '✓' : '❌ non supporté'))
    if (!('serviceWorker' in navigator)) { setDiagRunning(false); return }

    add('2. Notifications : ' + ('Notification' in window ? '✓' : '❌ non supporté'))
    if (!('Notification' in window)) { setDiagRunning(false); return }

    add('3. PushManager : ' + ('PushManager' in window ? '✓' : '❌ non supporté'))
    if (!('PushManager' in window)) { setDiagRunning(false); return }

    add(`4. Permission actuelle : ${Notification.permission}`)

    if (Notification.permission !== 'granted') {
      add('   → Demande de permission...')
      try {
        const p = await Notification.requestPermission()
        add(`   → Résultat : ${p}`)
        if (p !== 'granted') { setDiagRunning(false); return }
      } catch (e) { add(`❌ requestPermission erreur: ${e}`); setDiagRunning(false); return }
    }

    add('5. Enregistrement SW...')
    try {
      await navigator.serviceWorker.register('/sw.js')
      add('   ✓ SW enregistré')
    } catch (e) { add(`   ❌ SW register erreur: ${e}`); setDiagRunning(false); return }

    add('6. Attente SW ready (max 10s)...')
    let reg: ServiceWorkerRegistration
    try {
      reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout 10s')), 10000)),
      ])
      add('   ✓ SW actif')
    } catch (e) { add(`   ❌ SW ready erreur: ${e}`); setDiagRunning(false); return }

    add('7. Clé VAPID...')
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) { add('   ❌ NEXT_PUBLIC_VAPID_PUBLIC_KEY non définie'); setDiagRunning(false); return }
    add(`   ✓ ${vapidKey.substring(0, 20)}...`)

    add('8. Abonnement push...')
    let subscription: PushSubscription
    try {
      const existing = await reg!.pushManager.getSubscription()
      if (existing) {
        add('   ✓ Abonnement existant trouvé')
        subscription = existing
      } else {
        add('   → Création nouvel abonnement...')
        subscription = await reg!.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })
        add('   ✓ Abonnement créé')
      }
      add(`   endpoint: ...${subscription.endpoint.slice(-30)}`)
    } catch (e) { add(`   ❌ subscribe erreur: ${e}`); setDiagRunning(false); return }

    add('9. Sauvegarde Supabase...')
    try {
      const res = await fetch(`/api/${slug}/push-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id, subscription }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) add('   ✓ Sauvegardé !')
      else { add(`   ❌ API erreur ${res.status}: ${JSON.stringify(data)}`); setDiagRunning(false); return }
    } catch (e) { add(`   ❌ fetch erreur: ${e}`); setDiagRunning(false); return }

    add('10. Envoi notif test...')
    try {
      const res = await fetch(`/api/${slug}/admin/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '🔔 Test', body: 'Les notifications fonctionnent !', profile_id: profile.id }),
      })
      const data = await res.json().catch(() => ({}))
      add(`    → ${JSON.stringify(data)}`)
      if (data.pushed > 0) add('✅ SUCCÈS — notif envoyée !')
      else add('⚠️ Envoyé mais 0 push (voir erreurs ci-dessus)')
    } catch (e) { add(`    ❌ erreur: ${e}`) }

    setDiagRunning(false)
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
            {[1, 2, 3].map(i => <div key={i} className="h-4 rounded" style={{ background: 'rgba(34,211,238,0.07)' }} />)}
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: 'rgba(10,12,35,0.85)', border: '1px solid rgba(34,211,238,0.25)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}
                >
                  <User className="w-6 h-6" style={{ color: '#22d3ee' }} />
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

            {/* Notifications diagnostic */}
            <div className="rounded-2xl p-5 space-y-3"
              style={{ background: 'rgba(10,12,35,0.85)', border: '1px solid rgba(217,70,239,0.25)' }}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" style={{ color: '#d946ef' }} />
                <p className="text-sm font-bold text-white">Notifications push</p>
              </div>
              <button
                onPointerUp={runDiagnostic}
                disabled={diagRunning}
                className="w-full py-3 rounded-xl text-sm font-black transition-all"
                style={{ background: 'rgba(217,70,239,0.15)', color: '#d946ef', border: '1px solid rgba(217,70,239,0.4)', touchAction: 'manipulation', userSelect: 'none', opacity: diagRunning ? 0.7 : 1 }}
              >
                {diagRunning ? 'Test en cours...' : '🔔 Tester les notifications'}
              </button>
              {diagSteps.length > 0 && (
                <div className="rounded-xl p-3 space-y-1 overflow-auto max-h-80"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {diagSteps.map((s, i) => (
                    <p key={i} className="text-xs font-mono" style={{ color: s.includes('❌') ? '#f87171' : s.includes('✅') ? '#4ade80' : s.includes('✓') ? '#86efac' : '#94a3b8' }}>
                      {s}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium"
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
