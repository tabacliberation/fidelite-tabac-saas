'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Check, QrCode, ChevronRight } from 'lucide-react'

function PhoneMockup() {
  const offers = [
    { title: 'Café Offert',      stamps: 6,  done: 4, color: '#22d3ee', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=70' },
    { title: 'Canette Offerte',  stamps: 10, done: 7, color: '#d946ef', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=70' },
    { title: 'Sandwich Offert',  stamps: 8,  done: 2, color: '#8b5cf6', img: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=300&q=70' },
    { title: 'Barre Chocolat',   stamps: 5,  done: 5, color: '#f59e0b', img: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300&q=70' },
  ]

  return (
    <div className="relative mx-auto w-[260px]">
      <div className="relative bg-[#111] rounded-[40px] border-4 border-[#2a2a2a] shadow-2xl overflow-hidden" style={{ height: 520 }}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#111] rounded-b-2xl z-20" />

        <div className="absolute inset-0 bg-[#06061a] overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none' }}>

          {/* ── HERO ── */}
          <div className="relative h-36 flex flex-col justify-end overflow-hidden shrink-0">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.12) 0%, #06061a 60%, rgba(217,70,239,0.08) 100%)' }} />
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.04) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #06061a 0%, rgba(6,6,26,0.3) 100%)' }} />
            {/* Top bar */}
            <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-3">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.5)' }}>
                  <span className="text-[10px]">🚬</span>
                </div>
                <div>
                  <p className="text-white font-black text-[9px] leading-none">Bureau Tabac</p>
                  <p className="text-[8px] font-bold" style={{ color: '#22d3ee' }}>LIBÉRATION</p>
                </div>
              </div>
              <div className="text-[8px] font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(217,70,239,0.12)', border: '1px solid rgba(217,70,239,0.4)', color: '#d946ef' }}>Admin</div>
            </div>
            {/* Hero text */}
            <div className="relative px-3 pb-2">
              <p className="text-white font-black text-sm leading-tight">Gagnez des <span style={{ color: '#22d3ee' }}>récompenses</span></p>
              <p className="text-slate-500 text-[9px]">Cumulez vos tampons sans carte papier</p>
            </div>
          </div>

          {/* ── STATS ── */}
          <div className="flex shrink-0" style={{ borderTop: '1px solid rgba(34,211,238,0.12)', borderBottom: '1px solid rgba(34,211,238,0.12)', background: 'rgba(10,12,35,0.8)' }}>
            {[
              { v: '4', label: 'Offres',       color: '#22d3ee' },
              { v: '∞', label: 'Sans expiry',  color: '#d946ef' },
              { v: '🔔', label: 'Notifs push', color: '#8b5cf6' },
            ].map(({ v, label, color }, i) => (
              <div key={i} className="flex-1 flex flex-col items-center py-2" style={{ borderRight: i < 2 ? '1px solid rgba(34,211,238,0.08)' : 'none' }}>
                <span className="font-black text-sm" style={{ color }}>{v}</span>
                <span className="text-[8px] text-slate-600">{label}</span>
              </div>
            ))}
          </div>

          {/* ── TABS ── */}
          <div className="flex shrink-0" style={{ background: 'rgba(6,6,26,0.95)', borderBottom: '1px solid rgba(34,211,238,0.12)' }}>
            {['Nos Offres', 'Mes Jeux', 'Promos'].map((t, i) => (
              <div key={t} className="flex-1 py-2 text-center text-[9px] font-bold"
                style={i === 0 ? { color: '#22d3ee', borderBottom: '1.5px solid #22d3ee' } : { color: '#334155' }}>
                {t}
              </div>
            ))}
          </div>

          {/* ── GRILLE OFFRES ── */}
          <div className="px-2 pt-2 pb-14 grid grid-cols-2 gap-2">
            {offers.map((o, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: 'rgba(10,12,35,0.9)', border: `1px solid ${o.color}35` }}>
                {/* Photo */}
                <div className="relative h-16 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.img} alt={o.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,6,26,0.9) 0%, transparent 60%)' }} />
                  {/* Badge tampons */}
                  <div className="absolute top-1 left-1 rounded-full px-1.5 py-0.5 text-[7px] font-black" style={{ background: 'rgba(6,6,26,0.8)', border: `1px solid ${o.color}60`, color: o.color }}>
                    ×{o.stamps}
                  </div>
                  {o.done >= o.stamps && (
                    <div className="absolute top-1 right-1 rounded-full px-1.5 py-0.5 text-[7px] font-black" style={{ background: '#f59e0b', color: '#000' }}>✓</div>
                  )}
                  <p className="absolute bottom-1 left-1.5 text-white font-black text-[9px] leading-tight">{o.title}</p>
                </div>
                {/* Barre progression */}
                <div className="px-2 py-1.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: o.stamps }).map((_, j) => (
                      <div key={j} className="flex-1 h-1 rounded-full" style={{ background: j < o.done ? o.color : `${o.color}20` }} />
                    ))}
                  </div>
                  <p className="text-[8px] mt-0.5 text-right font-bold" style={{ color: o.color }}>{o.done}/{o.stamps}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM NAV ── */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around py-2.5 px-1" style={{ background: 'rgba(6,6,26,0.97)', borderTop: '1px solid rgba(34,211,238,0.2)' }}>
          {[
            { icon: '🏠', label: 'Vitrine',    active: true  },
            { icon: '🃏', label: 'Mes cartes', active: false },
            { icon: '🎁', label: 'Offres',     active: false },
            { icon: '👤', label: 'Profil',     active: false },
          ].map((n) => (
            <div key={n.label} className="flex flex-col items-center gap-0.5">
              <span className="text-sm">{n.icon}</span>
              <span className="text-[8px] font-bold" style={{ color: n.active ? '#22d3ee' : '#334155' }}>{n.label}</span>
              {n.active && <div className="w-4 h-0.5 rounded-full -mt-0.5" style={{ background: '#22d3ee' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Glow */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-25 bg-cyan-500 rounded-full scale-75" />
    </div>
  )
}

function AdminMockup() {
  const menuItems = [
    { label: 'Gestion des Offres',      sub: 'Créer, modifier',          color: '#22d3ee', emoji: '🎁' },
    { label: 'Clients inscrits',         sub: '127 membres',              color: '#d946ef', emoji: '👥' },
    { label: 'Cadeaux Roue',            sub: 'Lots à remettre',          color: '#f59e0b', emoji: '🎰' },
    { label: 'Notification push',        sub: 'Envoyer une promo',        color: '#8b5cf6', emoji: '🔔' },
    { label: 'Paramètres',              sub: 'Code PIN, config',         color: '#34d399', emoji: '⚙️' },
    { label: 'QR Code',                 sub: 'Imprimer / Télécharger',   color: '#a78bfa', emoji: '📲' },
  ]

  return (
    <div className="relative mx-auto w-[260px]">
      <div className="relative bg-[#111] rounded-[40px] border-4 border-[#333] shadow-2xl overflow-hidden" style={{ height: 520 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#111] rounded-b-2xl z-10" />
        <div className="absolute inset-0 bg-[#06061a] overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 pt-9 pb-3 border-b border-white/8">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.4)' }}>
              <span className="text-xs">🚬</span>
            </div>
            <div className="flex-1">
              <span className="text-white font-black text-xs leading-none block">Admin Panel</span>
              <span className="text-gray-600 text-[9px]">Tabac du Centre</span>
            </div>
            <span className="text-gray-600 text-[9px]">Déco</span>
          </div>

          {/* Menu items */}
          <div className="px-3 py-2 space-y-1.5">
            {menuItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2"
                style={{ background: 'rgba(10,12,35,0.85)', border: `1px solid ${item.color}25` }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}35` }}>
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[10px] font-bold leading-none truncate">{item.label}</p>
                  <p className="text-[9px] mt-0.5 truncate" style={{ color: item.color }}>{item.sub}</p>
                </div>
                <span className="text-gray-700 text-[10px]">›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-purple-500 rounded-full scale-75" />
    </div>
  )
}

const STEPS = [
  {
    id: 0,
    label: '1. Scanner le QR code',
    desc: 'Le client scanne le QR code affiché en caisse',
    color: '#22d3ee',
    screen: 'qr',
  },
  {
    id: 1,
    label: '2. Ouverture instantanée',
    desc: "L'app s'ouvre dans le navigateur, sans téléchargement",
    color: '#8b5cf6',
    screen: 'browser',
  },
  {
    id: 2,
    label: "3. Ajout à l'écran d'accueil",
    desc: "En un tap, l'app s'installe comme une vraie application",
    color: '#d946ef',
    screen: 'install',
  },
  {
    id: 3,
    label: '4. Icône sur le téléphone',
    desc: "L'icône apparaît sur l'écran d'accueil du client",
    color: '#f59e0b',
    screen: 'homescreen',
  },
  {
    id: 4,
    label: '5. Cartes fidélité actives',
    desc: 'Le client cumule ses tampons et suit ses récompenses',
    color: '#34d399',
    screen: 'app',
  },
]

function ClientJourneyAnimation() {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setStep(s => (s + 1) % STEPS.length)
        setAnimating(false)
      }, 300)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const current = STEPS[step]

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm px-4 py-1 rounded-full mb-4">
          Parcours client en 5 étapes
        </div>
        <h2 className="text-3xl font-black mb-4">Simple comme un coup de téléphone</h2>
        <p className="text-gray-400 max-w-lg mx-auto">De zéro à l&apos;app installée en moins de 30 secondes. Aucun App Store, aucun email.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Téléphone animé */}
        <div className="flex justify-center">
          <div className="relative" style={{ width: 240 }}>
            {/* Glow dynamique */}
            <div className="absolute inset-0 blur-3xl opacity-25 rounded-full scale-75 transition-all duration-700"
              style={{ background: current.color }} />

            {/* Coque téléphone */}
            <div className="relative bg-[#111] rounded-[38px] border-4 border-[#2a2a2a] shadow-2xl overflow-hidden"
              style={{ height: 480 }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#111] rounded-b-2xl z-20" />

              {/* Écran */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>

                {/* ÉTAPE 0 : QR code */}
                {step === 0 && (
                  <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                    {/* Viewfinder caméra */}
                    <div className="relative w-48 h-48 mb-4">
                      <div className="absolute inset-0 border-2 border-white/20 rounded-2xl" />
                      {/* Coins viseur */}
                      {[['top-0 left-0','border-t-2 border-l-2'],['top-0 right-0','border-t-2 border-r-2'],['bottom-0 left-0','border-b-2 border-l-2'],['bottom-0 right-0','border-b-2 border-r-2']].map(([pos, brd], i) => (
                        <div key={i} className={`absolute w-5 h-5 ${pos} ${brd}`} style={{ borderColor: '#22d3ee' }} />
                      ))}
                      {/* QR code simulé */}
                      <div className="absolute inset-4 grid grid-cols-7 grid-rows-7 gap-0.5 p-2">
                        {Array.from({length: 49}).map((_, i) => {
                          const pattern = [0,1,2,3,4,5,6,7,8,12,13,14,15,20,21,28,29,35,36,40,41,42,43,44,45,46,47,48]
                          return <div key={i} className="rounded-[1px]" style={{ background: pattern.includes(i) ? '#22d3ee' : 'transparent', opacity: pattern.includes(i) ? 1 : 0 }} />
                        })}
                      </div>
                      {/* Ligne de scan animée */}
                      <div className="absolute left-2 right-2 h-0.5 rounded-full animate-bounce"
                        style={{ background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)', top: '50%', animationDuration: '1.5s' }} />
                    </div>
                    <p className="text-white text-xs font-bold">Scanner le code</p>
                    <p className="text-gray-500 text-[10px] mt-1">Pointez vers le QR code en caisse</p>
                  </div>
                )}

                {/* ÉTAPE 1 : Navigateur */}
                {step === 1 && (
                  <div className="absolute inset-0 bg-[#0a0a0f]">
                    {/* Barre navigateur */}
                    <div className="bg-[#1a1a2e] pt-7 pb-2 px-3 border-b border-white/10">
                      <div className="flex items-center gap-2 bg-[#0d0d1f] rounded-full px-3 py-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-[9px] text-gray-400 flex-1 truncate">tabacfrance.fr/tabac-centre</span>
                      </div>
                      {/* Barre de chargement */}
                      <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full animate-pulse"
                          style={{ width: '75%', background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)' }} />
                      </div>
                    </div>
                    {/* Contenu page */}
                    <div className="px-4 pt-6 text-center">
                      <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                        style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.4)' }}>
                        <span className="text-xl">🚬</span>
                      </div>
                      <p className="text-white text-xs font-black">Tabac du Centre</p>
                      <p className="text-[9px] text-cyan-400 mt-0.5">Programme fidélité</p>
                      <div className="mt-4 space-y-2">
                        {['Café Offert — 6 tampons','Canette — 10 tampons'].map((t, i) => (
                          <div key={i} className="rounded-xl p-2.5 text-left"
                            style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
                            <p className="text-white text-[10px] font-bold">{t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 2 : Bannière installation */}
                {step === 2 && (
                  <div className="absolute inset-0 bg-[#0a0a0f]">
                    {/* Fond appli flouté */}
                    <div className="px-4 pt-10 opacity-40">
                      <div className="text-center mb-4">
                        <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                          style={{ background: 'rgba(34,211,238,0.15)' }}>
                          <span className="text-lg">🚬</span>
                        </div>
                        <p className="text-white text-xs font-black">Tabac du Centre</p>
                      </div>
                    </div>
                    {/* Overlay sombre */}
                    <div className="absolute inset-0 bg-black/50" />
                    {/* Bottom sheet installation */}
                    <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-5"
                      style={{ background: '#1c1c2e', border: '1px solid rgba(217,70,239,0.3)' }}>
                      <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)' }}>
                          <span className="text-xl">🚬</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-black">Tabac du Centre</p>
                          <p className="text-gray-400 text-[10px]">tabacfrance.fr</p>
                        </div>
                      </div>
                      <p className="text-white text-xs font-bold mb-1">Ajouter à l&apos;écran d&apos;accueil</p>
                      <p className="text-gray-400 text-[10px] mb-4">Accédez rapidement à votre programme fidélité</p>
                      <button className="w-full py-2.5 rounded-xl text-xs font-black text-black"
                        style={{ background: '#d946ef' }}>
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 3 : Écran d'accueil */}
                {step === 3 && (
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a1a3e 0%, #0d0d1f 100%)' }}>
                    <div className="pt-8 px-4">
                      <p className="text-white/40 text-[10px] text-center mb-4">Écran d&apos;accueil</p>
                      {/* Grille d'apps */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { emoji: '📱', name: 'Téléphone', bg: '#22c55e' },
                          { emoji: '📷', name: 'Caméra', bg: '#3b82f6' },
                          { emoji: '💬', name: 'Messages', bg: '#22c55e' },
                          { emoji: '🌐', name: 'Safari', bg: '#3b82f6' },
                          { emoji: '📧', name: 'Mail', bg: '#3b82f6' },
                          { emoji: '🗺️', name: 'Plans', bg: '#22c55e' },
                          { emoji: '🎵', name: 'Musique', bg: '#f43f5e' },
                          { emoji: '⚙️', name: 'Réglages', bg: '#94a3b8' },
                        ].map((app, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg"
                              style={{ background: app.bg }}>
                              {app.emoji}
                            </div>
                            <span className="text-[8px] text-white/60">{app.name}</span>
                          </div>
                        ))}
                        {/* Icône app installée — mise en avant */}
                        <div className="flex flex-col items-center gap-1 relative">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg ring-2 ring-offset-1 ring-offset-transparent"
                            style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(34,211,238,0.6)', boxShadow: '0 0 20px rgba(34,211,238,0.5)', ringColor: '#22d3ee' }}>
                            🚬
                          </div>
                          {/* Badge "Nouveau" */}
                          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3.5 h-3.5 flex items-center justify-center">
                            <span className="text-[7px] text-white font-black">N</span>
                          </div>
                          <span className="text-[8px] text-cyan-400 font-bold">Tabac</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 4 : App ouverte avec cartes */}
                {step === 4 && (
                  <div className="absolute inset-0 bg-[#06061a]">
                    {/* Header app */}
                    <div className="px-4 pt-8 pb-3"
                      style={{ background: 'rgba(10,12,35,0.9)', borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.4)' }}>
                            <span className="text-xs">🚬</span>
                          </div>
                          <div>
                            <p className="text-white text-[10px] font-black leading-none">Tabac du Centre</p>
                            <p className="text-[8px]" style={{ color: '#22d3ee' }}>FIDÉLITÉ</p>
                          </div>
                        </div>
                        <span className="text-green-400 text-[9px] font-bold">✓ Connecté</span>
                      </div>
                    </div>
                    {/* Bonjour */}
                    <div className="px-4 pt-3 pb-2">
                      <p className="text-white text-xs font-black">Bonjour, <span style={{ color: '#22d3ee' }}>Marie</span> 👋</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">3 points · 1 récompense obtenue</p>
                    </div>
                    {/* Cartes fidélité */}
                    <div className="px-4 space-y-2">
                      {[
                        { title: 'Café Offert', pts: 3, total: 6, color: '#22d3ee' },
                        { title: 'Canette', pts: 7, total: 10, color: '#d946ef' },
                        { title: 'Sandwich', pts: 2, total: 8, color: '#8b5cf6' },
                      ].map((card) => (
                        <div key={card.title} className="rounded-xl p-2.5"
                          style={{ background: 'rgba(10,12,35,0.85)', border: `1px solid ${card.color}30` }}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-white text-[10px] font-bold">{card.title}</span>
                            <span className="text-[9px] font-bold" style={{ color: card.color }}>{card.pts}/{card.total}</span>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({length: card.total}).map((_, i) => (
                              <div key={i} className="flex-1 h-1.5 rounded-full"
                                style={{ background: i < card.pts ? card.color : `${card.color}20` }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Bouton valider */}
                    <div className="px-4 mt-3">
                      <div className="py-2 rounded-xl text-center text-[10px] font-black"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                        ✚ Valider un achat
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Barre du bas téléphone */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Texte des étapes */}
        <div className="space-y-4">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`w-full text-left rounded-2xl px-5 py-4 transition-all duration-300 ${step === s.id ? 'scale-[1.02]' : 'opacity-50 hover:opacity-75'}`}
              style={step === s.id
                ? { background: `${s.color}10`, border: `1px solid ${s.color}40`, boxShadow: `0 0 20px ${s.color}15` }
                : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-black transition-all"
                  style={step === s.id
                    ? { background: `${s.color}20`, border: `1px solid ${s.color}50`, color: s.color }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569' }
                  }
                >
                  {s.id + 1}
                </div>
                <div>
                  <p className="text-sm font-black transition-colors"
                    style={{ color: step === s.id ? '#fff' : '#475569' }}>
                    {s.label}
                  </p>
                  {step === s.id && (
                    <p className="text-xs mt-0.5" style={{ color: s.color }}>{s.desc}</p>
                  )}
                </div>
              </div>
              {step === s.id && (
                <div className="mt-3 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" key={step}
                    style={{ background: s.color, animation: 'progress 3s linear forwards' }} />
                </div>
              )}
            </button>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes progress {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0a0a0f]/95 backdrop-blur z-50">
        <div className="text-xl font-bold text-cyan-400">
          Fidélité<span className="text-white">Tabac</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <a href="#comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</a>
          <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
            Voir la démo
          </Link>
          <Link href="/connexion" className="text-sm text-gray-400 hover:text-white transition-colors border border-white/20 hover:border-white/40 px-4 py-2 rounded-full transition-colors hidden sm:block">
            Se connecter
          </Link>
          <Link href="/inscription" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2 rounded-full text-sm transition-colors">
            Démarrer gratuitement
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm px-4 py-1 rounded-full mb-6">
              + de 0 buralistes nous font confiance
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Fidélisez vos clients avec une application
              <span className="text-cyan-400"> à votre image</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Vos clients téléchargent votre app, cumulent des tampons, jouent à la roue de la chance et reçoivent vos promos directement sur leur téléphone. <strong className="text-white">Prêt en 5 minutes.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/inscription" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-4 rounded-full text-lg transition-colors flex items-center justify-center gap-2">
                Créer mon application <ChevronRight size={20} />
              </Link>
              <Link href="/demo" className="border border-white/20 hover:border-cyan-400 hover:text-cyan-400 px-8 py-4 rounded-full text-lg transition-colors text-center">
                Voir la démo en direct
              </Link>
            </div>
            <p className="text-gray-600 text-sm mt-4">14 jours d&apos;essai gratuit · Aucune carte bancaire</p>
          </div>
          <div className="flex justify-center">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Bandeau chiffres */}
      <section className="border-y border-white/10 bg-white/2 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { val: '5 min', label: 'Pour créer votre app' },
            { val: '100%', label: 'Personnalisable' },
            { val: '0€', label: "Pour démarrer l'essai" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-black text-cyan-400">{s.val}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-6 py-20 max-w-5xl mx-auto" id="comment-ca-marche">
        <h2 className="text-3xl font-black text-center mb-4">Comment ça marche ?</h2>
        <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">Vous créez votre application en quelques minutes, vos clients l&apos;utilisent immédiatement.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Ligne de connexion */}
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-cyan-500/50 to-purple-500/50" />

          {[
            {
              num: '1',
              color: 'bg-cyan-500',
              title: 'Vous créez votre app',
              desc: 'Renseignez le nom de votre tabac, votre email et choisissez votre formule. Votre application est prête en 5 minutes.',
              detail: 'Aucune compétence technique requise',
            },
            {
              num: '2',
              color: 'bg-purple-500',
              title: 'Vos clients la téléchargent',
              desc: 'Affichez votre QR code en caisse. Vos clients le scannent et installent l\'app sur leur téléphone en 30 secondes.',
              detail: 'Compatible iPhone et Android',
            },
            {
              num: '3',
              color: 'bg-pink-500',
              title: 'Vous fidélisez',
              desc: 'Validez les tampons depuis votre téléphone avec votre code PIN. Envoyez des promos quand vous voulez.',
              detail: 'Clients qui reviennent + souvent',
            },
          ].map((step, i) => (
            <div key={i} className="relative text-center">
              <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-black font-black text-2xl mx-auto mb-5 shadow-lg`}>
                {step.num}
              </div>
              <h3 className="font-black text-xl mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">{step.desc}</p>
              <span className="text-xs text-cyan-400 font-medium">{step.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Animation parcours client */}
      <ClientJourneyAnimation />

      {/* Features avec mockup admin */}
      <section className="px-6 py-20 bg-gradient-to-b from-white/2 to-transparent">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="flex justify-center">
            <AdminMockup />
          </div>
          <div>
            <h2 className="text-3xl font-black mb-4">Un panel admin complet<br /><span className="text-purple-400">sur votre téléphone</span></h2>
            <p className="text-gray-400 mb-8">Gérez tout depuis votre caisse. Ajoutez des tampons en 2 secondes, voyez tous vos clients, envoyez une promo en un clic.</p>
            <div className="space-y-4">
              {[
                { icon: '👥', title: 'Liste de tous vos clients', desc: 'Nom, téléphone, progression sur chaque offre' },
                { icon: '✅', title: 'Validation des tampons par PIN', desc: 'Entrez votre code secret pour valider — sécurisé' },
                { icon: '📢', title: 'Notifications push ciblées', desc: 'Envoyez un message à tous vos clients en un clic' },
                { icon: '🎡', title: 'Roue de la chance', desc: 'Suivez les gains et marquez-les comme remis' },
              ].map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <div className="font-bold text-sm">{f.title}</div>
                    <div className="text-gray-400 text-sm">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QR Code section */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-cyan-500/10 to-green-500/10 border border-cyan-500/20 rounded-3xl p-10 text-center">
          <div className="text-5xl mb-4">
            <QrCode size={56} className="text-cyan-400 mx-auto" />
          </div>
          <h2 className="text-3xl font-black mb-4">Votre QR code prêt à imprimer</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">
            Dès votre inscription, vous recevez un QR code personnalisé à votre tabac. Imprimez-le, affichez-le en caisse. Vos clients le scannent et s&apos;inscrivent en 30 secondes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscription" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-full transition-colors">
              Obtenir mon QR code
            </Link>
            <Link href="/demo" className="border border-white/20 hover:border-cyan-400 px-8 py-3 rounded-full transition-colors">
              Voir un exemple
            </Link>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="px-6 py-20 max-w-4xl mx-auto" id="tarifs">
        <h2 className="text-3xl font-black text-center mb-4">Choisissez votre formule</h2>
        <p className="text-gray-400 text-center mb-12">14 jours d&apos;essai gratuit — aucune carte bancaire requise</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Flex */}
          <div className="bg-white/5 border border-white/15 rounded-3xl p-8">
            <div className="text-xs font-black text-gray-400 tracking-widest mb-3">FLEX</div>
            <h3 className="text-2xl font-black mb-1">Sans engagement</h3>
            <p className="text-gray-500 text-sm mb-6">Résiliable à tout moment, sans condition</p>
            <div className="text-4xl font-black mb-6">29,90€<span className="text-gray-400 text-base font-normal"> /mois TTC</span></div>
            <ul className="space-y-2 mb-8">
              {['Application personnalisée à votre nom','Clients et offres illimités','Notifications push','Roue de la chance','QR Code imprimable','Support email','Résiliation à tout moment'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={14} className="text-gray-400 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/inscription?plan=flex" className="block w-full border-2 border-white/20 hover:border-cyan-400 hover:text-cyan-400 font-bold py-4 rounded-full text-center transition-colors">
              Choisir Flex
            </Link>
          </div>

          {/* Engagement */}
          <div className="relative bg-gradient-to-b from-cyan-500/10 to-purple-500/5 border-2 border-cyan-500/50 rounded-3xl p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-xs font-black px-5 py-1.5 rounded-full whitespace-nowrap">
              ⭐ MEILLEURE OFFRE — ÉCONOMISEZ 120€/AN
            </div>
            <div className="text-xs font-black text-cyan-400 tracking-widest mb-3">ENGAGEMENT 12 MOIS</div>
            <h3 className="text-2xl font-black mb-1">Avec engagement</h3>
            <p className="text-gray-500 text-sm mb-6">12 mois minimum — le meilleur rapport qualité/prix</p>
            <div className="text-4xl font-black text-cyan-400 mb-6">19,90€<span className="text-gray-400 text-base font-normal"> /mois TTC</span></div>
            <ul className="space-y-2 mb-8">
              {['Application personnalisée à votre nom','Clients et offres illimités','Notifications push','Roue de la chance','QR Code imprimable','Support prioritaire','Engagement 12 mois minimum'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={14} className="text-cyan-400 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/inscription?plan=engagement" className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-black font-bold py-4 rounded-full text-center transition-opacity">
              Choisir Engagement
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">Prix TTC. Paiement sécurisé. Facturation mensuelle.</p>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 max-w-3xl mx-auto" id="faq">
        <h2 className="text-3xl font-black text-center mb-12">Questions fréquentes</h2>
        <div className="space-y-4">
          {[
            {
              q: "Est-ce que mes clients ont besoin de télécharger une app ?",
              a: "Non, ils scannent votre QR code, ouvrent le site dans leur navigateur et peuvent l'installer comme une app (PWA) en un clic. Aucun App Store nécessaire."
            },
            {
              q: "Comment valider les tampons en caisse ?",
              a: "Vous avez un code PIN secret. Quand un client présente son téléphone, vous cliquez sur + dans son profil et saisissez votre PIN. Ça prend 5 secondes."
            },
            {
              q: "Puis-je personnaliser les offres ?",
              a: "Oui, vous créez autant d'offres que vous voulez : café offert au 5ème, canette au 10ème, recharge au 8ème... Vous choisissez le nombre de tampons et la récompense."
            },
            {
              q: "Que se passe-t-il si je résilie ?",
              a: "Sur la formule Flex, vous résiliez à tout moment. Sur la formule Engagement, vous vous engagez 12 mois. Dans les deux cas, vos données sont conservées 30 jours après résiliation."
            },
            {
              q: "L'application sera-t-elle à mon nom ?",
              a: "Oui, elle affiche le nom de votre tabac, votre adresse et vos offres. Vos clients voient votre marque, pas la nôtre."
            },
          ].map((item, i) => (
            <details key={i} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-medium list-none hover:bg-white/5 transition-colors">
                {item.q}
                <ChevronRight size={18} className="text-gray-400 group-open:rotate-90 transition-transform shrink-0 ml-4" />
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-3xl p-12">
          <h2 className="text-3xl font-black mb-4">Prêt à fidéliser vos clients ?</h2>
          <p className="text-gray-400 mb-8">Rejoignez les buralistes qui font revenir leurs clients chaque semaine.</p>
          <Link href="/inscription" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-10 py-4 rounded-full text-lg transition-colors">
            Créer mon application gratuitement <ChevronRight size={20} />
          </Link>
          <p className="text-gray-600 text-sm mt-4">14 jours d&apos;essai · Sans carte bancaire · Prêt en 5 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 sm:px-6 py-10 text-center text-gray-500 text-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-cyan-400 font-bold mb-1 text-base">FidélitéTabac</div>
          <p className="text-xs text-gray-600 mb-1">par Ring&apos;s Shop — SIRET : 793 550 989 00024</p>
          <p className="mb-5">La solution de fidélité digitale pour les buralistes de France.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs">
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <a href="mailto:tahardjamel22@gmail.com" className="hover:text-white transition-colors">tahardjamel22@gmail.com</a>
          </div>
          <p className="text-xs text-gray-700 mt-5">© {new Date().getFullYear()} Ring&apos;s Shop — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  )
}
