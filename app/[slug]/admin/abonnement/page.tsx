'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, CheckCircle, AlertTriangle, Clock, XCircle, Loader2, ExternalLink } from 'lucide-react'

type AbonnementData = {
  status: 'trial' | 'active' | 'past_due' | 'canceled'
  trialEndsAt: string | null
  planName: 'flex' | 'engagement' | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  portalUrl: string | null
}

type CheckoutState = 'idle' | 'loading'

const PLAN_LABELS: Record<string, string> = {
  flex: 'Flex — Sans engagement',
  engagement: 'Engagement 12 mois',
}

const PLAN_PRICES: Record<string, string> = {
  flex: '29,90€/mois',
  engagement: '19,90€/mois',
}

export default function AbonnementPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [data, setData] = useState<AbonnementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkout, setCheckout] = useState<CheckoutState>('idle')
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(`admin_${slug}`)
    if (!stored) { router.push(`/${slug}/admin`); return }

    fetch(`/api/${slug}/admin/abonnement`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [slug, router])

  const handleSubscribe = async (plan: 'flex' | 'engagement') => {
    setCheckout('loading')
    setCheckoutError('')
    try {
      const res = await fetch(`/api/${slug}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur')
      window.location.href = d.url
    } catch (e: unknown) {
      setCheckoutError(e instanceof Error ? e.message : 'Erreur')
      setCheckout('idle')
    }
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const daysLeft = (iso: string | null) => {
    if (!iso) return null
    const diff = new Date(iso).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06061a' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!data) return null

  const statusConfig = {
    trial: {
      label: 'Essai gratuit',
      icon: Clock,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.25)',
      desc: `Votre essai se termine le ${formatDate(data.trialEndsAt)}`,
    },
    active: {
      label: 'Abonnement actif',
      icon: CheckCircle,
      color: '#34d399',
      bg: 'rgba(52,211,153,0.08)',
      border: 'rgba(52,211,153,0.25)',
      desc: data.cancelAtPeriodEnd
        ? `Se termine le ${formatDate(data.currentPeriodEnd)} (annulation en cours)`
        : `Renouvellement le ${formatDate(data.currentPeriodEnd)}`,
    },
    past_due: {
      label: 'Paiement échoué',
      icon: AlertTriangle,
      color: '#f87171',
      bg: 'rgba(248,113,113,0.08)',
      border: 'rgba(248,113,113,0.35)',
      desc: 'Votre carte a été refusée. Mettez à jour vos informations de paiement pour continuer.',
    },
    canceled: {
      label: 'Abonnement résilié',
      icon: XCircle,
      color: '#94a3b8',
      bg: 'rgba(148,163,184,0.08)',
      border: 'rgba(148,163,184,0.2)',
      desc: "Votre abonnement a été annulé. Réabonnez-vous pour réactiver votre application.",
    },
  }

  const s = statusConfig[data.status]
  const StatusIcon = s.icon

  return (
    <div className="min-h-screen px-5 page-top-pad pb-10 neon-grid" style={{ background: '#06061a' }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push(`/${slug}/admin`)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: '#22d3ee' }} />
        </button>
        <div>
          <h1 className="font-black text-white">Mon abonnement</h1>
          <p className="text-xs" style={{ color: '#475569' }}>Gérez votre formule</p>
        </div>
      </div>

      {/* Statut actuel */}
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: s.bg, border: `1px solid ${s.border}` }}>
        <div className="flex items-center gap-3 mb-2">
          <StatusIcon className="w-5 h-5" style={{ color: s.color }} />
          <span className="font-black text-white">{s.label}</span>
        </div>
        <p className="text-sm" style={{ color: s.color }}>{s.desc}</p>
        {data.status === 'trial' && data.trialEndsAt && (
          <div className="mt-3 rounded-xl px-3 py-2 inline-flex items-center gap-2"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Clock className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
            <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>
              {daysLeft(data.trialEndsAt)} jour{daysLeft(data.trialEndsAt) !== 1 ? 's' : ''} restant{daysLeft(data.trialEndsAt) !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Plan actif (si abonné) */}
      {data.status === 'active' && data.planName && (
        <div className="rounded-2xl p-5 mb-6"
          style={{ background: 'rgba(10,12,35,0.85)', border: '1px solid rgba(34,211,238,0.2)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: '#475569' }}>VOTRE FORMULE</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-white">{PLAN_LABELS[data.planName]}</p>
              <p className="text-sm" style={{ color: '#22d3ee' }}>{PLAN_PRICES[data.planName]}</p>
            </div>
            <CreditCard className="w-6 h-6" style={{ color: '#22d3ee' }} />
          </div>
        </div>
      )}

      {/* Gérer via portail Stripe (si actif ou past_due) */}
      {data.portalUrl && (data.status === 'active' || data.status === 'past_due') && (
        <a
          href={data.portalUrl}
          className="w-full flex items-center justify-between rounded-2xl p-4 mb-6 transition-all active:scale-95"
          style={{
            background: data.status === 'past_due' ? 'rgba(248,113,113,0.08)' : 'rgba(10,12,35,0.85)',
            border: `1px solid ${data.status === 'past_due' ? 'rgba(248,113,113,0.4)' : 'rgba(34,211,238,0.2)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: data.status === 'past_due' ? 'rgba(248,113,113,0.12)' : 'rgba(34,211,238,0.1)',
                border: `1px solid ${data.status === 'past_due' ? 'rgba(248,113,113,0.3)' : 'rgba(34,211,238,0.2)'}`,
              }}>
              <CreditCard className="w-5 h-5" style={{ color: data.status === 'past_due' ? '#f87171' : '#22d3ee' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {data.status === 'past_due' ? 'Mettre à jour le paiement' : 'Gérer mon abonnement'}
              </p>
              <p className="text-xs" style={{ color: '#475569' }}>
                {data.status === 'past_due'
                  ? 'Corriger le problème de paiement'
                  : 'Changer de plan, factures, résiliation'}
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4" style={{ color: '#475569' }} />
        </a>
      )}

      {/* Choix de plan (si trial, canceled, ou past_due sans portal) */}
      {(data.status === 'trial' || data.status === 'canceled' || (data.status === 'past_due' && !data.portalUrl)) && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-white mb-2">
            {data.status === 'trial' ? 'Choisissez votre formule avant la fin de l\'essai' : 'Réactivez votre application'}
          </p>

          {checkoutError && (
            <p className="text-sm rounded-xl px-4 py-3"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {checkoutError}
            </p>
          )}

          {/* Plan Engagement */}
          <div className="rounded-2xl p-5 relative"
            style={{ background: 'rgba(34,211,238,0.06)', border: '2px solid rgba(34,211,238,0.4)' }}>
            <div className="absolute -top-3 left-4 rounded-full px-3 py-1 text-xs font-black text-black"
              style={{ background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)' }}>
              MEILLEURE OFFRE — ÉCONOMISEZ 120€/AN
            </div>
            <div className="flex items-start justify-between mb-3 mt-1">
              <div>
                <p className="font-black text-white">Engagement 12 mois</p>
                <p className="text-xs" style={{ color: '#475569' }}>12 mois minimum</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black" style={{ color: '#22d3ee' }}>19,90€</p>
                <p className="text-xs" style={{ color: '#475569' }}>/mois TTC</p>
              </div>
            </div>
            <button
              onClick={() => handleSubscribe('engagement')}
              disabled={checkout === 'loading'}
              className="w-full py-3 rounded-xl font-black text-black flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)' }}
            >
              {checkout === 'loading' && <Loader2 size={16} className="animate-spin" />}
              Choisir Engagement
            </button>
          </div>

          {/* Plan Flex */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(10,12,35,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-black text-white">Flex — Sans engagement</p>
                <p className="text-xs" style={{ color: '#475569' }}>Résiliable à tout moment</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white">29,90€</p>
                <p className="text-xs" style={{ color: '#475569' }}>/mois TTC</p>
              </div>
            </div>
            <button
              onClick={() => handleSubscribe('flex')}
              disabled={checkout === 'loading'}
              className="w-full py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {checkout === 'loading' && <Loader2 size={16} className="animate-spin" />}
              Choisir Flex
            </button>
          </div>
        </div>
      )}

      {/* Infos légales */}
      <p className="text-xs text-center mt-8" style={{ color: '#334155' }}>
        Paiement sécurisé par Stripe · Facturation mensuelle · Prix TTC
      </p>
    </div>
  )
}
