'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Gift, Sparkles, LayoutDashboard, Coffee, Package, Smartphone, Star, Zap } from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  coffee: Coffee, Coffee: Coffee,
  package: Package, Package: Package,
  smartphone: Smartphone, Smartphone: Smartphone,
  gift: Gift, Gift: Gift,
  star: Star, Star: Star,
  zap: Zap, Zap: Zap,
  tag: Gift, Tag: Gift,
}

const NEONS = [
  { text: '#22d3ee', glow: 'rgba(34,211,238,0.6)', border: 'rgba(34,211,238,0.35)', bg: 'rgba(34,211,238,0.08)' },
  { text: '#d946ef', glow: 'rgba(217,70,239,0.6)', border: 'rgba(217,70,239,0.35)', bg: 'rgba(217,70,239,0.08)' },
  { text: '#8b5cf6', glow: 'rgba(139,92,246,0.6)', border: 'rgba(139,92,246,0.35)', bg: 'rgba(139,92,246,0.08)' },
  { text: '#34d399', glow: 'rgba(52,211,153,0.6)',  border: 'rgba(52,211,153,0.35)',  bg: 'rgba(52,211,153,0.08)'  },
  { text: '#f472b6', glow: 'rgba(244,114,182,0.6)', border: 'rgba(244,114,182,0.35)', bg: 'rgba(244,114,182,0.08)' },
  { text: '#fb923c', glow: 'rgba(251,146,60,0.6)',  border: 'rgba(251,146,60,0.35)',  bg: 'rgba(251,146,60,0.08)'  },
]

interface Offer {
  id: string
  title: string
  description: string | null
  required_points: number
  reward: string | null
  icon: string
  image_url: string | null
}

export default function OfferDetailPage() {
  const { slug, offerId } = useParams<{ slug: string; offerId: string }>()
  const router = useRouter()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [neon, setNeon] = useState(NEONS[0])

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem(`profile_${slug}`))

    fetch(`/api/${slug}/offers/${offerId}`)
      .then(async r => {
        const text = await r.text()
        if (!text.trim()) throw new Error('Réponse vide')
        return JSON.parse(text)
      })
      .then(data => {
        if (data?.id) {
          setOffer(data)
          const icons = Object.keys(iconMap)
          const idx = icons.indexOf(data.icon)
          setNeon(NEONS[Math.max(0, idx) % NEONS.length])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug, offerId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center neon-grid" style={{ background: '#06061a' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center neon-grid" style={{ background: '#06061a' }}>
        <Gift className="w-12 h-12 mb-4" style={{ color: '#22d3ee' }} />
        <p className="text-white font-bold">Offre introuvable</p>
        <button onClick={() => router.back()} className="mt-4 text-sm" style={{ color: '#475569' }}>← Retour</button>
      </div>
    )
  }

  const Icon = iconMap[offer.icon] ?? Gift
  const stamps = Array.from({ length: offer.required_points })

  return (
    <div className="min-h-screen neon-grid pb-10" style={{ background: '#06061a' }}>

      {/* Hero photo */}
      <div className="relative h-72">
        {offer.image_url ? (
          <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center neon-grid" style={{ background: 'rgba(6,6,26,0.95)' }}>
            <Icon className="w-20 h-20" style={{ color: neon.text, filter: `drop-shadow(0 0 20px ${neon.text})` }} />
          </div>
        )}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #06061a 0%, rgba(6,6,26,0.4) 60%, transparent 100%)' }} />

        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: 'rgba(6,6,26,0.7)', border: '1px solid rgba(34,211,238,0.3)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#22d3ee' }} />
        </button>

        {/* Badge tampons */}
        <div className="absolute top-12 right-4 rounded-full px-3 py-1.5 text-xs font-black"
          style={{ background: 'rgba(6,6,26,0.7)', border: `1px solid ${neon.border}`, color: neon.text, boxShadow: `0 0 10px ${neon.glow}`, backdropFilter: 'blur(8px)' }}
        >
          {offer.required_points} tampons
        </div>

        {/* Titre */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <h1 className="text-2xl font-black text-white leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {offer.title}
          </h1>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">

        {/* Description */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(10,12,35,0.85)', border: `1px solid ${neon.border}`, boxShadow: `0 0 20px ${neon.bg}` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: neon.bg, border: `1px solid ${neon.border}` }}
            >
              <Icon className="w-4 h-4" style={{ color: neon.text, filter: `drop-shadow(0 0 4px ${neon.text})` }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: neon.text }}>Description</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {offer.description ?? 'Aucune description disponible.'}
          </p>
        </div>

        {/* Récompense */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(10,12,35,0.85)', border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 0 20px rgba(245,158,11,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4" style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 4px #f59e0b)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>Récompense</span>
          </div>
          <p className="text-white font-black text-lg">{offer.reward}</p>
        </div>

        {/* Tampons visuels */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(10,12,35,0.85)', border: `1px solid ${neon.border}` }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: neon.text }}>
            Progression ({offer.required_points} tampons requis)
          </p>
          <div className="flex flex-wrap gap-2">
            {stamps.map((_, i) => (
              <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${neon.border}` }}
              >
                <Icon className="w-4 h-4" style={{ color: neon.text, opacity: 0.35 }} />
              </div>
            ))}
          </div>
          <div className="mt-4 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full w-0 rounded-full" style={{ background: neon.text }} />
          </div>
          <p className="text-xs mt-2" style={{ color: '#475569' }}>0 / {offer.required_points} tampons</p>
        </div>

        {/* CTA */}
        {isLoggedIn ? (
          <button
            onClick={() => router.push(`/${slug}/dashboard`)}
            className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: neon.bg, color: neon.text, border: `1px solid ${neon.border}`, boxShadow: `0 0 20px ${neon.bg}` }}
          >
            <LayoutDashboard className="w-5 h-5" />
            Voir ma carte fidélité
          </button>
        ) : (
          <button
            onClick={() => router.push(`/${slug}/register`)}
            className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: neon.bg, color: neon.text, border: `1px solid ${neon.border}`, boxShadow: `0 0 20px ${neon.bg}` }}
          >
            <Sparkles className="w-5 h-5" />
            Rejoindre et commencer à cumuler
          </button>
        )}
      </div>
    </div>
  )
}
