'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, Phone, Calendar, LogOut, Bell } from 'lucide-react'

export default function ProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(`profile_${slug}`)
    if (!stored) { router.replace(`/${slug}/register`); return }
    setProfile(JSON.parse(stored))
    setLoading(false)
  }, [slug, router])

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

            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(10,12,35,0.85)', border: '1px solid rgba(217,70,239,0.25)', boxShadow: '0 0 20px rgba(217,70,239,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" style={{ color: '#d946ef', filter: 'drop-shadow(0 0 4px #d946ef)' }} />
                <div>
                  <p className="text-sm font-medium text-white">Notifications</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>Promos &amp; cadeau anniversaire</p>
                </div>
              </div>
            </div>

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
