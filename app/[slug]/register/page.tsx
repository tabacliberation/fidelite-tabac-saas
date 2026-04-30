'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Cigarette, Sparkles } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', birthDate: '' })

  const inputClass =
    'w-full rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none transition-all' +
    ' bg-[rgba(10,12,35,0.8)] border border-[rgba(34,211,238,0.2)] focus:border-[rgba(34,211,238,0.6)]'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription")
      localStorage.setItem(`profile_${slug}`, JSON.stringify(data.profile))
      router.push(`/${slug}/dashboard`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!form.phone) { setError('Entrez votre numéro de téléphone'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/${slug}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Numéro non trouvé')
      localStorage.setItem(`profile_${slug}`, JSON.stringify(data.profile))
      router.push(`/${slug}/dashboard`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen neon-grid flex flex-col pb-8" style={{ background: '#06061a' }}>
      <div className="px-5 page-top-pad pb-5" style={{ background: 'rgba(10,12,35,0.9)', borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
        <div className="flex items-center gap-3">
          <Link href={`/${slug}`} style={{ color: '#475569' }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.4)' }}
            >
              <Cigarette className="w-4 h-4" style={{ color: '#22d3ee' }} />
            </div>
            <span className="font-black text-sm neon-cyan">Fidélité<span className="text-white">Tabac</span></span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pt-8 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" style={{ color: '#22d3ee' }} />
          <h2 className="text-2xl font-black text-white">Créer mon compte</h2>
        </div>
        <p className="text-sm mb-7" style={{ color: '#475569' }}>
          Programme fidélité 100% gratuit. Pas d&apos;email requis.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" required placeholder="Prénom *" value={form.firstName}
            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            className={inputClass}
          />
          <input type="text" required placeholder="Nom *" value={form.lastName}
            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            className={inputClass}
          />
          <input type="tel" required placeholder="Téléphone *" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className={inputClass}
          />
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#64748b' }}>
              Date de naissance (surprise anniversaire 🎂)
            </label>
            <input type="date" value={form.birthDate}
              onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all mt-2 neon-btn"
            style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.5)' }}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Création...' : 'Créer mon compte gratuit'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: '1px solid rgba(34,211,238,0.1)' }} />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs" style={{ background: '#06061a', color: '#475569' }}>
              Déjà inscrit ?
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <input type="tel" placeholder="Mon numéro de téléphone" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className={inputClass}
          />
          <button type="button" onClick={handleLogin} disabled={loading}
            className="w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
            style={{ border: '1px solid rgba(34,211,238,0.25)', color: '#94a3b8' }}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Me reconnecter avec mon téléphone
          </button>
        </div>
      </div>
    </div>
  )
}
