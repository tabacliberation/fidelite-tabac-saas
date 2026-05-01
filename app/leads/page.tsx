'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Check, Loader2 } from 'lucide-react'

export default function LeadsPage() {
  const [form, setForm] = useState({ email: '', firstName: '', shopName: '', city: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) setDone(true)
    else setError('Une erreur est survenue, réessayez.')
    setLoading(false)
  }

  const inputClass = 'w-full rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all bg-slate-900/60 border border-slate-700 focus:border-cyan-400/60'

  return (
    <div className="min-h-screen neon-grid flex flex-col" style={{ background: '#06061a' }}>
      <div className="scan-line" />

      <header className="flex items-center px-6 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ChevronLeft size={18} /> Retour
        </Link>
        <div className="mx-auto text-lg font-bold" style={{ color: '#22d3ee' }}>
          Tabac<span className="text-white">France</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 24px rgba(34,211,238,0.3)' }}>
                <Check className="w-8 h-8" style={{ color: '#22d3ee' }} />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Vous êtes inscrit !</h2>
              <p className="text-slate-400 mb-8">Nous vous contacterons très prochainement avec une offre exclusive pour votre bureau de tabac.</p>
              <Link href="/inscription"
                className="inline-block font-bold px-8 py-4 rounded-2xl transition-all"
                style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 16px rgba(34,211,238,0.2)' }}>
                Démarrer mon essai gratuit →
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-bold"
                  style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)', color: '#22d3ee' }}>
                  🚬 Offre buralistes — 14 jours gratuits
                </div>
                <h1 className="text-3xl font-black text-white mb-3 leading-tight">
                  Fidélisez vos clients<br />
                  <span style={{ color: '#22d3ee' }}>sans effort</span>
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Laissez vos coordonnées, on vous montre comment TabacFrance peut booster la fidélité de vos clients en 5 minutes.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Votre prénom</label>
                  <input
                    type="text"
                    placeholder="Jean"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Nom de votre tabac</label>
                  <input
                    type="text"
                    placeholder="Tabac du Centre"
                    value={form.shopName}
                    onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Ville</label>
                  <input
                    type="text"
                    placeholder="Paris"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Email professionnel *</label>
                  <input
                    type="email"
                    placeholder="votre@email.fr"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <div className="pt-2">
                  <button type="submit" disabled={loading}
                    className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 20px rgba(34,211,238,0.2)' }}>
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? 'Inscription...' : 'Je veux en savoir plus →'}
                  </button>
                </div>

                <p className="text-slate-600 text-xs text-center leading-relaxed">
                  En vous inscrivant, vous acceptez de recevoir des informations sur TabacFrance.<br />
                  Désabonnement possible à tout moment. Aucun spam.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
