'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'

export default function ConnexionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Identifiants incorrects')

      // Stocker la session admin et rediriger vers le panel
      localStorage.setItem(`admin_${data.slug}`, '1')
      router.push(`/${data.slug}/admin`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#06061a] text-white flex flex-col neon-grid">
      <div className="scan-line" />

      <header className="flex items-center px-6 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} /> Retour
        </Link>
        <div className="mx-auto text-lg font-bold neon-cyan">
          Fidélité<span className="text-white">Tabac</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-black mb-2 text-white">Se connecter</h1>
          <p className="text-slate-400 mb-8 text-sm">Accédez à votre espace buraliste</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition-colors"
                style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(34,211,238,0.2)'}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none transition-colors"
                style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(34,211,238,0.2)'}
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm text-red-400"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 neon-btn"
              style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.5)', color: '#22d3ee' }}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Connexion...' : 'Accéder à mon espace'}
            </button>

            <p className="text-center text-slate-500 text-sm pt-2">
              Pas encore de compte ?{' '}
              <Link href="/inscription" className="neon-cyan hover:underline font-bold">
                Créer mon application
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
