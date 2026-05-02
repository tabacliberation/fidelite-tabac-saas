'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Lock, Users, Gift, Send, Settings, ChevronRight, Cigarette, QrCode, Star, Loader2, CreditCard } from 'lucide-react'


export default function AdminPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [shopName, setShopName] = useState('Mon Tabac')

  useEffect(() => {
    const stored = localStorage.getItem(`admin_${slug}`)
    if (stored) {
      setAuthed(true)
      fetch(`/api/${slug}/admin/stats`).then(r => r.json()).then(d => {
        if (d.shopName) setShopName(d.shopName)
      }).catch(() => {})
    }
    setChecking(false)
  }, [slug])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/${slug}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Identifiants incorrects')
      localStorage.setItem(`admin_${slug}`, '1')
      setAuthed(true)
      if (data.shopName) setShopName(data.shopName)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl py-4 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none transition-all' +
    ' bg-[rgba(10,12,35,0.8)] border border-[rgba(34,211,238,0.2)] focus:border-[rgba(34,211,238,0.6)]' +
    ' focus:shadow-[0_0_12px_rgba(34,211,238,0.15)]'

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06061a' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen neon-grid flex flex-col px-6" style={{ background: '#06061a' }}>
        {/* Lien retour vitrine */}
        <div className="pt-safe pt-4 pb-2">
          <button onClick={() => router.push(`/${slug}`)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl"
            style={{ color: '#475569' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Retour à la vitrine
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 24px rgba(34,211,238,0.3)' }}
          >
            <Cigarette className="w-8 h-8" style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 6px #22d3ee)' }} />
          </div>
          <h1 className="text-xl font-black text-white mb-1">Administration</h1>
          <p className="text-sm mb-8" style={{ color: '#475569' }}>Espace réservé au buraliste</p>

          <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
              <input type="email" placeholder="Email" required value={email}
                onChange={e => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
              <input type="password" placeholder="Mot de passe" required value={password}
                onChange={e => setPassword(e.target.value)} className={inputClass} />
            </div>
            {error && (
              <p className="text-sm rounded-xl px-4 py-3"
                style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                {error}
              </p>
            )}
            <button type="submit" disabled={loading}
              className="w-full font-black py-4 rounded-xl disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 16px rgba(34,211,238,0.2)' }}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: `/${slug}/admin/offers`,     label: 'Gestion des Offres',      icon: Gift,     desc: 'Créer, modifier, archiver',   color: { text: '#22d3ee', bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.25)'  } },
    { href: `/${slug}/admin/clients`,   label: 'Clients inscrits',         icon: Users,    desc: 'Voir tous les membres',        color: { text: '#d946ef', bg: 'rgba(217,70,239,0.08)',  border: 'rgba(217,70,239,0.25)'  } },
    { href: `/${slug}/admin/wheel-wins`,label: 'Cadeaux Roue',             icon: Star,     desc: 'Lots à remettre aux clients',  color: { text: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)'  } },
    { href: `/${slug}/admin/push`,      label: 'Envoyer une notification', icon: Send,     desc: 'Promo à tous les clients',     color: { text: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.25)'  } },
    { href: `/${slug}/admin/settings`,  label: 'Paramètres',               icon: Settings, desc: 'Code PIN et configuration',   color: { text: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)'  } },
    { href: `/${slug}/admin/qrcode`,    label: 'QR Code',                  icon: QrCode,   desc: 'Imprimer / Télécharger',       color: { text: '#a78bfa', bg: 'rgba(167,139,250,0.08)',  border: 'rgba(167,139,250,0.25)'  } },
    { href: `/${slug}/admin/abonnement`, label: 'Mon abonnement',           icon: CreditCard, desc: 'Formule, facturation, résiliation', color: { text: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)' } },
  ]

  return (
    <div className="min-h-screen neon-grid px-5 page-top-pad pb-10" style={{ background: '#06061a' }}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 12px rgba(34,211,238,0.2)' }}
        >
          <Cigarette className="w-5 h-5" style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 4px #22d3ee)' }} />
        </div>
        <div>
          <h1 className="font-black text-white">Admin Panel</h1>
          <p className="text-xs" style={{ color: '#475569' }}>{shopName}</p>
        </div>
      </div>

      <div className="space-y-3">
        {navItems.map(({ href, label, icon: Icon, desc, color }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="w-full flex items-center gap-4 rounded-2xl p-4 transition-all active:scale-95"
            style={{ background: 'rgba(10,12,35,0.85)', border: `1px solid ${color.border}`, boxShadow: `0 0 16px ${color.bg}` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: color.bg, border: `1px solid ${color.border}` }}
            >
              <Icon className="w-5 h-5" style={{ color: color.text, filter: `drop-shadow(0 0 4px ${color.text})` }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white">{label}</p>
              <p className="text-xs" style={{ color: '#475569' }}>{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#475569' }} />
          </button>
        ))}
      </div>

      <button
        onClick={() => { localStorage.removeItem(`admin_${slug}`); setAuthed(false) }}
        className="mt-8 text-sm underline"
        style={{ color: '#475569' }}
      >
        Déconnexion
      </button>
    </div>
  )
}
