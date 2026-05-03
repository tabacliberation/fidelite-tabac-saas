'use client'

import { Coffee, Package, Smartphone, Gift, Star, Zap } from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  Coffee, Package, Smartphone, Gift, Star, Zap,
  coffee: Coffee, package: Package, smartphone: Smartphone, gift: Gift, star: Star, zap: Zap,
}

const NEON_COLORS = [
  { text: '#22d3ee', glow: 'rgba(34,211,238,0.6)',  bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.3)'  },
  { text: '#d946ef', glow: 'rgba(217,70,239,0.6)',  bg: 'rgba(217,70,239,0.08)',  border: 'rgba(217,70,239,0.3)'  },
  { text: '#8b5cf6', glow: 'rgba(139,92,246,0.6)',  bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.3)'  },
  { text: '#34d399', glow: 'rgba(52,211,153,0.6)',  bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.3)'  },
  { text: '#f472b6', glow: 'rgba(244,114,182,0.6)', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.3)' },
  { text: '#fb923c', glow: 'rgba(251,146,60,0.6)',  bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.3)'  },
]

interface Card {
  offer_id: string
  current_points: number
  completed_count: number
  offer: { title: string; description: string | null; required_points: number; reward: string | null; icon: string; expires_at?: string | null }
}

function expiresLabel(expiresAt: string): string | null {
  const diff = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
  if (diff < 0) return null
  if (diff === 0) return "Expire aujourd'hui !"
  if (diff === 1) return 'Expire demain !'
  return `Expire dans ${diff}j`
}

export default function LoyaltyCard({ card, index = 0 }: { card: Card; index?: number }) {
  const { offer, current_points, completed_count } = card
  const Icon = iconMap[offer.icon] ?? Gift
  const neon = NEON_COLORS[index % NEON_COLORS.length]
  const progress = Math.min(current_points / offer.required_points, 1)
  const stamps = Array.from({ length: offer.required_points })

  return (
    <div className="rounded-2xl p-5" style={{
      background: 'rgba(10,12,35,0.9)',
      border: `1px solid ${neon.border}`,
      boxShadow: `0 0 20px ${neon.bg}, inset 0 0 20px rgba(0,0,0,0.3)`,
    }}>
      {offer.expires_at && expiresLabel(offer.expires_at) && (
        <div className="mb-3 px-3 py-1.5 rounded-xl text-xs font-black text-center animate-pulse"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}
        >
          ⚡ {expiresLabel(offer.expires_at)}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: neon.bg, border: `1px solid ${neon.border}`, boxShadow: `0 0 10px ${neon.bg}` }}
          >
            <Icon className="w-5 h-5" style={{ color: neon.text, filter: `drop-shadow(0 0 4px ${neon.text})` }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#e2e8f0' }}>{offer.title}</h3>
            {offer.description && <p className="text-xs text-slate-500">{offer.description}</p>}
          </div>
        </div>
        {completed_count > 0 && (
          <span className="text-xs px-2 py-1 rounded-full font-bold"
            style={{ color: neon.text, background: neon.bg, border: `1px solid ${neon.border}` }}
          >
            ×{completed_count}
          </span>
        )}
      </div>

      {/* Tampons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {stamps.map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={i < current_points
              ? { background: neon.bg, border: `1px solid ${neon.text}`, boxShadow: `0 0 8px ${neon.glow}` }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            {i < current_points && (
              <Icon className="w-4 h-4" style={{ color: neon.text, filter: `drop-shadow(0 0 3px ${neon.text})` }} />
            )}
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%`, background: neon.text, boxShadow: `0 0 8px ${neon.glow}` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-slate-500">{current_points} / {offer.required_points}</span>
        <span className="text-xs font-bold" style={{ color: neon.text }}>{offer.reward}</span>
      </div>
    </div>
  )
}
