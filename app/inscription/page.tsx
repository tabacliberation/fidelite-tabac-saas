'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, Check } from 'lucide-react'

const PLANS = {
  flex: {
    label: 'Flex — Sans engagement',
    monthly: '29,90€ / mois',
    desc: 'Résiliable à tout moment',
    color: 'border-white/30',
    badge: null,
  },
  engagement: {
    label: 'Engagement 12 mois',
    monthly: '19,90€ / mois',
    desc: 'Économisez 120€ par an',
    color: 'border-cyan-500',
    badge: 'Meilleure offre',
  },
}

function InscriptionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<'flex' | 'engagement'>('engagement')
  const [form, setForm] = useState({
    shopName: '',
    slug: '',
    address: '',
    phone: '',
    adminEmail: '',
    adminPassword: '',
  })

  useEffect(() => {
    const p = searchParams.get('plan')
    if (p === 'flex' || p === 'engagement') setPlan(p)
  }, [searchParams])

  const handleSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setForm(f => ({ ...f, shopName: name, slug: handleSlug(name) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription")
      router.push(`/${form.slug}/admin`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <header className="flex items-center px-6 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} /> Retour
        </Link>
        <div className="mx-auto text-lg font-bold text-cyan-400">
          Fidélité<span className="text-white">Tabac</span>
        </div>
      </header>

      <div className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-black mb-2">Créer votre application</h1>
        <p className="text-gray-400 mb-8 text-sm">14 jours d&apos;essai gratuit — aucune carte bancaire requise</p>

        {/* Choix du plan */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-3">Choisissez votre formule</p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPlan(key)}
                className={`relative border-2 rounded-2xl p-4 text-left transition-all ${plan === key ? p.color + ' bg-white/5' : 'border-white/10'}`}
              >
                {p.badge && (
                  <span className="absolute -top-2 left-3 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-300">{key === 'engagement' ? '12 MOIS' : 'FLEX'}</span>
                  {plan === key && <Check size={14} className="text-cyan-400" />}
                </div>
                <div className={`text-lg font-black ${plan === key ? 'text-cyan-400' : 'text-white'}`}>
                  {p.monthly.split(' / ')[0]}
                </div>
                <div className="text-gray-500 text-xs">/ mois</div>
                <div className="text-gray-500 text-xs mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom de votre tabac *</label>
            <input
              type="text" required value={form.shopName} onChange={handleNameChange}
              placeholder="Ex: Tabac du Centre"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Identifiant de votre app</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 gap-1 focus-within:border-cyan-500 transition-colors">
              <span className="text-gray-500 text-sm">/</span>
              <input
                type="text" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: handleSlug(e.target.value) }))}
                className="flex-1 bg-transparent text-white focus:outline-none text-sm"
                placeholder="tabac-du-centre"
              />
            </div>
            <p className="text-gray-600 text-xs mt-1">URL de votre app — généré automatiquement</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Adresse *</label>
            <input
              type="text" required value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Ex: 12 rue de la Paix, 75001 Paris"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
            <input
              type="tel" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Ex: 04 76 00 00 00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email admin *</label>
            <input
              type="email" required value={form.adminEmail}
              onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))}
              placeholder="votre@email.fr"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Mot de passe admin *</label>
            <input
              type="password" required minLength={6} value={form.adminPassword}
              onChange={e => setForm(f => ({ ...f, adminPassword: e.target.value }))}
              placeholder="Minimum 6 caractères"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-4 rounded-full text-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? 'Création en cours...' : 'Créer mon application'}
          </button>

          <p className="text-center text-gray-500 text-xs">
            En vous inscrivant vous acceptez nos conditions d&apos;utilisation.
          </p>
        </form>
      </div>
    </div>
  )
}

export default function InscriptionPage() {
  return (
    <Suspense>
      <InscriptionForm />
    </Suspense>
  )
}
