'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Plus, Bell, Cigarette } from 'lucide-react'
import LoyaltyCard from '@/components/LoyaltyCard'
import LoyaltyCardSkeleton from '@/components/LoyaltyCardSkeleton'
import PinModal from '@/components/PinModal'

interface Profile { id: string; first_name: string; last_name: string; phone: string }
interface Card {
  id: string; offer_id: string; current_points: number; completed_count: number
  offer: { id: string; title: string; description: string | null; required_points: number; reward: string | null; icon: string }
}

function DrumPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const touchStartY = useRef(0)
  const inc = () => onChange(value < 10 ? value + 1 : 1)
  const dec = () => onChange(value > 1 ? value - 1 : 10)
  const prev = value > 1 ? value - 1 : 10
  const next = value < 10 ? value + 1 : 1
  return (
    <div className="flex flex-col items-center mx-auto select-none" style={{ width: 100 }}
      onTouchStart={e => { touchStartY.current = e.touches[0].clientY }}
      onTouchEnd={e => { const dy = touchStartY.current - e.changedTouches[0].clientY; if (dy > 15) inc(); else if (dy < -15) dec() }}
    >
      <button onClick={inc} className="w-full py-1 flex justify-center" style={{ color: '#334155', fontSize: 22 }}>▲</button>
      <div className="w-full flex items-center justify-center font-black" style={{ height: 40, fontSize: 22, color: '#1e293b' }}>{prev}</div>
      <div className="w-full flex items-center justify-center font-black rounded-xl"
        style={{ height: 56, fontSize: 44, color: '#22d3ee', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.4)', textShadow: '0 0 16px rgba(34,211,238,0.8)' }}
      >{value}</div>
      <div className="w-full flex items-center justify-center font-black" style={{ height: 40, fontSize: 22, color: '#1e293b' }}>{next}</div>
      <button onClick={dec} className="w-full py-1 flex justify-center" style={{ color: '#334155', fontSize: 22 }}>▼</button>
    </div>
  )
}

export default function DashboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [showDrum, setShowDrum] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [stampCount, setStampCount] = useState(1)
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  const fetchCards = useCallback((profileId: string) => {
    fetch(`/api/${slug}/dashboard?profileId=${profileId}`)
      .then(r => r.json())
      .then(data => {
        setCards(data.cards || [])
        if (data.locked) setIsLocked(true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  const refreshUnread = (profileId: string) => {
    fetch(`/api/${slug}/notifications?profile_id=${profileId}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUnreadCount(data.filter((n: { read: boolean }) => !n.read).length) })
      .catch(() => {})
  }

  useEffect(() => {
    const stored = localStorage.getItem(`profile_${slug}`)
    if (!stored) { router.replace(`/${slug}/register`); return }
    const p = JSON.parse(stored)
    setProfile(p)
    fetchCards(p.id)
    refreshUnread(p.id)

    const onVisible = () => { if (document.visibilityState === 'visible') refreshUnread(p.id) }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [slug, router, fetchCards])

  const handleAddPoint = (offerId: string) => {
    setSelectedOffer(offerId); setStampCount(1); setPinError(''); setShowDrum(true)
  }

  const handlePinConfirm = async (pin: string) => {
    if (!selectedOffer || !profile) return
    setPinLoading(true)
    setPinError('')
    const res = await fetch(`/api/${slug}/admin/add-point`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: profile.id, offerId: selectedOffer, action: 'add', pin, count: stampCount }),
    })
    const data = await res.json()
    setPinLoading(false)
    if (!res.ok) {
      setPinError(data.error ?? 'PIN incorrect')
      if (data.locked) { setIsLocked(true); setShowPin(false) }
      return
    }
    setShowPin(false)
    fetchCards(profile.id)
  }

  const totalPoints = cards.reduce((s, c) => s + c.current_points, 0)
  const completedTotal = cards.reduce((s, c) => s + c.completed_count, 0)

  return (
    <div className="min-h-screen pb-24 neon-grid" style={{ background: '#06061a' }}>

      {/* Header */}
      <div className="px-5 pb-6 page-top-pad" style={{ background: 'rgba(10,12,35,0.9)', borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 12px rgba(34,211,238,0.2)' }}
            >
              <Cigarette className="w-5 h-5" style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 4px #22d3ee)' }} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Bureau Tabac</p>
              <p className="font-black text-white text-sm neon-cyan">FIDÉLITÉ</p>
            </div>
          </div>
          <button onClick={() => router.push(`/${slug}/notifications`)} className="relative" style={{ color: '#475569' }}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="h-6 rounded w-48 animate-pulse" style={{ background: 'rgba(34,211,238,0.1)' }} />
        ) : (
          <div>
            <h2 className="text-xl font-black text-white">
              Bonjour, <span style={{ color: '#22d3ee', textShadow: '0 0 8px #22d3ee' }}>{profile?.first_name}</span> 👋
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {totalPoints} points · {completedTotal} récompenses obtenues
            </p>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="px-5 space-y-4 mt-5">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#22d3ee', textShadow: '0 0 6px #22d3ee' }}>
          Mes cartes fidélité
        </h3>

        {isLocked && (
          <div className="rounded-2xl px-4 py-4 flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }}
          >
            <span className="text-xl">🔒</span>
            <div>
              <p className="font-black text-sm" style={{ color: '#ef4444' }}>Compte bloqué</p>
              <p className="text-xs mt-0.5" style={{ color: '#fca5a5' }}>
                Trop de codes PIN incorrects. Présentez-vous en caisse pour débloquer votre compte.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <>
            <LoyaltyCardSkeleton />
            <LoyaltyCardSkeleton />
          </>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-500">
            <p className="text-sm">Aucune carte pour l&apos;instant.</p>
            <p className="text-xs mt-1">Faites valider vos achats en caisse !</p>
          </div>
        ) : (
          cards.map((card, i) => (
            <div key={card.offer_id}>
              <LoyaltyCard card={card} index={i} />
              {!isLocked && (
                <button onClick={() => handleAddPoint(card.offer_id)}
                  className="w-full mt-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-black active:scale-95 transition-all"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  <Plus className="w-3.5 h-3.5" /> Valider un achat
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Drum */}
      {showDrum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-xs rounded-3xl p-6 text-center" style={{ background: 'rgba(6,6,26,0.98)', border: '1px solid rgba(34,211,238,0.3)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#22d3ee' }}>Tampons à valider</p>
            <p className="text-white font-bold text-sm mb-5">Combien d&apos;achats ?</p>
            <DrumPicker value={stampCount} onChange={setStampCount} />
            <p className="text-xs mt-3 mb-5" style={{ color: '#64748b' }}>{stampCount} tampon{stampCount > 1 ? 's' : ''}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDrum(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
              >Annuler</button>
              <button onClick={() => { setShowDrum(false); setShowPin(true) }}
                className="flex-1 py-3 rounded-xl text-sm font-black"
                style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)' }}
              >Continuer →</button>
            </div>
          </div>
        </div>
      )}

      {/* PinModal keypad */}
      {showPin && (
        <PinModal
          title={`Valider ${stampCount} tampon${stampCount > 1 ? 's' : ''}`}
          loading={pinLoading}
          onConfirm={handlePinConfirm}
          onClose={() => setShowPin(false)}
        />
      )}

      {pinError && (
        <div className="fixed bottom-24 left-4 right-4 text-sm text-center py-3 rounded-xl"
          style={{ background: '#ef4444', color: '#fff' }}>
          {pinError}
        </div>
      )}
    </div>
  )
}
