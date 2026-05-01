'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ouvre le client mail avec les données pré-remplies
    const body = encodeURIComponent(
      `Nom : ${form.name}\nEmail : ${form.email}\n\n${form.message}`
    )
    const subject = encodeURIComponent(form.subject || 'Contact TabacFrance')
    window.location.href = `mailto:contact@tabacfrance.fr?subject=${subject}&body=${body}`
    setSent(true)
  }

  const inputClass =
    'w-full rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none transition-all text-sm sm:text-base' +
    ' bg-white/5 border border-white/15 focus:border-cyan-500/60 focus:bg-white/8'

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="sticky top-0 z-50 px-4 sm:px-6 py-4 border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur flex items-center gap-4">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Retour
        </Link>
        <h1 className="text-base sm:text-lg font-black text-white">Contact</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Infos directes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <a href="mailto:contact@tabacfrance.fr"
            className="flex items-center gap-3 rounded-2xl p-4 border border-cyan-500/25 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Email</p>
              <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                contact@tabacfrance.fr
              </p>
            </div>
          </a>

          <div className="flex items-center gap-3 rounded-2xl p-4 border border-white/10 bg-white/3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Société</p>
              <p className="text-sm font-bold text-white">Ring&apos;s Shop</p>
              <p className="text-xs text-gray-600">SIRET : 793 550 989 00024</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        {sent ? (
          <div className="rounded-2xl p-8 text-center border border-green-500/30 bg-green-500/5">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-black text-lg mb-1">Message prêt à envoyer !</p>
            <p className="text-gray-400 text-sm">Votre client mail a été ouvert avec votre message pré-rempli.</p>
            <button onClick={() => setSent(false)}
              className="mt-4 text-sm text-cyan-400 underline hover:text-cyan-300">
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base sm:text-lg font-black text-white mb-4">Envoyez-nous un message</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Votre nom *</label>
                <input
                  required
                  placeholder="Jean Dupont"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Votre email *</label>
                <input
                  required
                  type="email"
                  placeholder="jean@monbureautabac.fr"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Sujet</label>
              <input
                placeholder="Demande d'information, support technique..."
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Message *</label>
              <textarea
                required
                rows={5}
                placeholder="Décrivez votre demande..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className={inputClass + ' resize-none'}
              />
            </div>

            <button type="submit"
              className="w-full font-black py-4 rounded-xl text-base transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 20px rgba(34,211,238,0.15)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              Envoyer le message
            </button>

            <p className="text-xs text-center text-gray-600">
              Réponse garantie sous 24–48h ouvrées
            </p>
          </form>
        )}
      </main>
    </div>
  )
}
