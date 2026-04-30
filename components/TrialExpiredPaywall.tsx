'use client'

import { useState } from 'react'
import { Sparkles, Check, Loader2, Lock } from 'lucide-react'

const PLANS = [
  {
    key: 'flex',
    label: 'Flex',
    sublabel: 'Sans engagement',
    price: '29,90€',
    desc: 'Résiliable à tout moment',
    features: [
      'Application personnalisée',
      'Clients et offres illimités',
      'Notifications push',
      'Roue de la chance',
      'QR Code imprimable',
      'Support email',
    ],
    highlight: false,
  },
  {
    key: 'engagement',
    label: 'Engagement',
    sublabel: '12 mois',
    price: '19,90€',
    desc: 'Économisez 120€/an',
    features: [
      'Application personnalisée',
      'Clients et offres illimités',
      'Notifications push',
      'Roue de la chance',
      'QR Code imprimable',
      'Support prioritaire',
    ],
    highlight: true,
  },
]

export default function TrialExpiredPaywall({ slug, shopName }: { slug: string; shopName: string }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleChoose = async (plan: string) => {
    setLoading(plan)
    setError('')
    const res = await fetch(`/api/${slug}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (!res.ok || !data.url) {
      setError(data.error || 'Erreur lors de la redirection vers le paiement')
      setLoading(null)
      return
    }
    window.location.href = data.url
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: '#06061a' }}>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', boxShadow: '0 0 30px rgba(245,158,11,0.15)' }}
          >
            <Lock className="w-7 h-7" style={{ color: '#f59e0b' }} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Essai terminé</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Les 14 jours d&apos;essai de <span className="font-bold" style={{ color: '#94a3b8' }}>{shopName}</span> sont écoulés.<br />
            Choisissez une formule pour continuer.
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-4 mb-6">
          {PLANS.map(plan => (
            <div key={plan.key} className="rounded-2xl p-5"
              style={plan.highlight
                ? { background: 'rgba(34,211,238,0.06)', border: '2px solid rgba(34,211,238,0.4)', boxShadow: '0 0 20px rgba(34,211,238,0.1)' }
                : { background: 'rgba(10,12,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {plan.highlight && (
                <div className="text-[10px] font-black tracking-widest mb-3 px-2 py-1 rounded-full inline-block"
                  style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}
                >
                  ⭐ MEILLEURE OFFRE
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-black text-white text-lg leading-none">{plan.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{plan.sublabel} — {plan.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black" style={{ color: plan.highlight ? '#22d3ee' : '#f1f5f9' }}>{plan.price}</span>
                  <p className="text-xs" style={{ color: '#475569' }}>/mois TTC</p>
                </div>
              </div>
              <ul className="space-y-1.5 mb-4">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
                    <Check className="w-3 h-3 shrink-0" style={{ color: plan.highlight ? '#22d3ee' : '#475569' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleChoose(plan.key)}
                disabled={!!loading}
                className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                style={plan.highlight
                  ? { background: 'rgba(34,211,238,0.18)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.5)', boxShadow: '0 0 16px rgba(34,211,238,0.15)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {loading === plan.key
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirection...</>
                  : <><Sparkles className="w-4 h-4" /> Choisir {plan.label}</>
                }
              </button>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs text-center rounded-xl px-4 py-3 mb-4"
            style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}
          >
            {error}
          </p>
        )}

        <p className="text-center text-xs" style={{ color: '#334155' }}>
          Paiement sécurisé via Stripe · Sans engagement pour la formule Flex
        </p>
      </div>
    </div>
  )
}
