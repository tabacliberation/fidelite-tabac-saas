'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, Gift } from 'lucide-react'

interface WheelWin {
  id: string
  profile_id: string | null
  prize: string
  won_at: string
  collected: boolean
  profiles?: { first_name: string; last_name: string; phone: string } | null
}

const PRIZE_LABELS: Record<string, string> = {
  canette:  '1 Canette 🥤',
  chocolat: '1 Barre chocolat 🍫',
  malabar:  '1 Malabar 🍭',
  bonbon:   '1 Sachet de bonbon 🍬',
  zippo:    '🔥 Briquet Zippo 40€',
}

const PRIZE_COLORS: Record<string, string> = {
  canette:  '#22d3ee',
  chocolat: '#d97706',
  malabar:  '#ec4899',
  bonbon:   '#f59e0b',
  zippo:    '#ef4444',
}

export default function WheelWinsPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [wins, setWins] = useState<WheelWin[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWins = () => {
    fetch(`/api/${slug}/wheel-wins`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setWins(data); setLoading(false) })
  }

  useEffect(() => {
    if (!localStorage.getItem(`admin_${slug}`)) { router.push(`/${slug}/admin`); return }
    fetchWins()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const markCollected = async (id: string) => {
    await fetch(`/api/${slug}/wheel-wins`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchWins()
  }

  const pending = wins.filter(w => !w.collected)
  const done = wins.filter(w => w.collected)

  return (
    <div className="min-h-screen neon-grid px-5 pb-8 page-top-pad" style={{ background: '#06061a' }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} style={{ color: '#475569' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-white flex-1">Cadeaux Roue</h1>
        {pending.length > 0 && (
          <span className="text-xs px-2 py-1 rounded-full font-black animate-pulse"
            style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            {pending.length} à remettre
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(34,211,238,0.05)' }} />
          ))}
        </div>
      ) : wins.length === 0 ? (
        <div className="flex flex-col items-center py-20" style={{ color: '#475569' }}>
          <Gift className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">Aucun lot gagné pour l&apos;instant</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#ef4444' }}>
                À remettre au client
              </h2>
              <div className="space-y-3">
                {pending.map(win => {
                  const color = PRIZE_COLORS[win.prize] ?? '#22d3ee'
                  return (
                    <div key={win.id} className="rounded-2xl p-4"
                      style={{ background: 'rgba(10,12,35,0.9)', border: `1px solid ${color}40`, boxShadow: `0 0 16px ${color}10` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                        >
                          <Clock className="w-5 h-5" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm" style={{ color }}>{PRIZE_LABELS[win.prize] ?? win.prize}</p>
                          <p className="text-xs mt-0.5 font-semibold text-white">
                            {win.profiles ? `${win.profiles.first_name} ${win.profiles.last_name}` : 'Client anonyme'}
                          </p>
                          {win.profiles?.phone && <p className="text-xs" style={{ color: '#64748b' }}>{win.profiles.phone}</p>}
                          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                            {new Date(win.won_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button onClick={() => markCollected(win.id)}
                          className="shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95"
                          style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)' }}
                        >
                          Remis ✓
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#475569' }}>
                Déjà remis ({done.length})
              </h2>
              <div className="space-y-2">
                {done.map(win => (
                  <div key={win.id} className="rounded-2xl p-3 flex items-center gap-3 opacity-50"
                    style={{ background: 'rgba(10,12,35,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#4ade80' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{PRIZE_LABELS[win.prize] ?? win.prize}</p>
                      <p className="text-xs" style={{ color: '#475569' }}>
                        {win.profiles ? `${win.profiles.first_name} ${win.profiles.last_name}` : 'Anonyme'} • {new Date(win.won_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
