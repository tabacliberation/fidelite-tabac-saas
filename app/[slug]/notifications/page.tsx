'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'

interface Notification {
  id: string
  title: string
  body: string | null
  image: string | null
  url: string | null
  read: boolean
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Il y a ${hrs}h`
  return `Il y a ${Math.floor(hrs / 24)}j`
}

export default function NotificationsPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(`profile_${slug}`)
    if (!stored) { router.replace(`/${slug}/register`); return }
    const profile = JSON.parse(stored)

    fetch(`/api/${slug}/notifications?profile_id=${profile.id}`)
      .then(r => r.json())
      .then(data => { setNotifs(Array.isArray(data) ? data : []); setLoading(false) })

    // Marquer toutes comme lues
    fetch(`/api/${slug}/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profile.id }),
    }).catch(() => {})
  }, [slug, router])

  return (
    <div className="min-h-screen neon-grid pb-24" style={{ background: '#06061a' }}>
      <div className="px-5 pb-5 page-top-pad" style={{ background: 'rgba(10,12,35,0.9)', borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} style={{ color: '#475569' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black text-white">
            Mes <span style={{ color: '#22d3ee', textShadow: '0 0 8px #22d3ee' }}>Notifications</span>
          </h1>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(34,211,238,0.05)' }} />
          ))
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center py-20" style={{ color: '#475569' }}>
            <Bell className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Aucune notification récente</p>
          </div>
        ) : (
          notifs.map(n => (
            <div key={n.id} className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(10,12,35,0.85)', border: `1px solid ${n.read ? 'rgba(34,211,238,0.08)' : 'rgba(34,211,238,0.3)'}`, opacity: n.read ? 0.7 : 1 }}
            >
              {n.image && <img src={n.image} alt="" className="w-full h-32 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-white text-sm">{n.title}</p>
                  <span className="text-[10px] shrink-0" style={{ color: '#475569' }}>{timeAgo(n.created_at)}</span>
                </div>
                {n.body && <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{n.body}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
