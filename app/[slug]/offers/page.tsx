'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Coffee, Package, Smartphone, Gift, Star, Zap } from 'lucide-react'
import Link from 'next/link'

const iconMap: Record<string, React.ElementType> = {
  coffee: Coffee, Coffee: Coffee,
  package: Package, Package: Package,
  smartphone: Smartphone, Smartphone: Smartphone,
  gift: Gift, Gift: Gift,
  star: Star, Star: Star,
  zap: Zap, Zap: Zap,
  Tag: Gift, tag: Gift,
}

const NEONS = [
  { text: '#22d3ee', glow: 'rgba(34,211,238,0.6)', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)' },
  { text: '#d946ef', glow: 'rgba(217,70,239,0.6)', bg: 'rgba(217,70,239,0.08)', border: 'rgba(217,70,239,0.25)' },
  { text: '#8b5cf6', glow: 'rgba(139,92,246,0.6)', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
  { text: '#f59e0b', glow: 'rgba(245,158,11,0.6)',  bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)'  },
]

export default function OffersPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/${slug}/admin/offers`).then(r => r.json()).then(d => {
      setOffers((d.offers || []).filter((o: any) => o.is_active))
      setLoading(false)
    })
  }, [slug])

  return (
    <div className="min-h-screen neon-grid pb-24" style={{ background: '#06061a' }}>
      <div className="px-5 pb-5 page-top-pad" style={{ background: 'rgba(10,12,35,0.9)', borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
        <h1 className="text-xl font-black text-white">
          Nos <span style={{ color: '#22d3ee', textShadow: '0 0 8px #22d3ee' }}>Offres</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>Toutes les offres fidélité actives</p>
      </div>

      <div className="px-5 mt-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#22d3ee', textShadow: '0 0 6px #22d3ee' }}>
          Programme fidélité
        </h3>

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse h-24"
              style={{ background: 'rgba(10,12,35,0.8)', border: '1px solid rgba(34,211,238,0.08)' }}
            />
          ))
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center py-20" style={{ color: '#475569' }}>
            <Gift className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Aucune offre disponible</p>
          </div>
        ) : (
          offers.map((offer, idx) => {
            const Icon = iconMap[offer.icon] ?? Gift
            const neon = NEONS[idx % NEONS.length]
            return (
              <Link key={offer.id} href={`/${slug}/offers/${offer.id}`}
                className="rounded-2xl overflow-hidden active:scale-95 transition-transform block"
                style={{ background: 'rgba(10,12,35,0.85)', border: `1px solid ${neon.border}`, boxShadow: `0 0 20px ${neon.bg}` }}
              >
                {offer.image_url && (
                  <img src={offer.image_url} alt={offer.title} className="w-full h-36 object-cover" />
                )}
                <div className="p-4 flex items-center gap-4">
                  {!offer.image_url && (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: neon.bg, border: `1px solid ${neon.border}`, boxShadow: `0 0 10px ${neon.bg}` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: neon.text, filter: `drop-shadow(0 0 4px ${neon.text})` }} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">{offer.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{offer.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ color: neon.text, background: neon.bg, border: `1px solid ${neon.border}` }}
                      >
                        {offer.required_points} tampons
                      </span>
                      <span className="text-xs font-semibold" style={{ color: neon.text }}>
                        → {offer.reward}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}

        {/* CTA si non connecté */}
        {!loading && (
          <button onClick={() => router.push(`/${slug}/register`)}
            className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 neon-btn"
            style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.5)', color: '#22d3ee' }}
          >
            Rejoindre le programme fidélité
          </button>
        )}
      </div>
    </div>
  )
}
