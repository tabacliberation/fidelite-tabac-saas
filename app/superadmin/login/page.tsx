'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperAdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/superadmin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/superadmin')
    } else {
      setError('Email ou mot de passe incorrect')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen neon-grid flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="neon-card rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold neon-cyan text-center mb-2">Super Admin</h1>
        <p className="text-slate-400 text-sm text-center mb-8">TabacFrance</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm block mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-colors neon-btn"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
