'use client'

import { useEffect, useState } from 'react'
import { X, Share, Plus, Download } from 'lucide-react'

interface Props {
  slug: string
  shopName: string
}

export default function PWAInstallBanner({ slug, shopName }: Props) {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Déjà installé en mode standalone → ne rien montrer
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    if (isStandalone) return

    // Snooze de 3 jours si l'utilisateur a cliqué "Plus tard"
    const snoozeKey = `pwa_snooze_${slug}`
    const snoozeUntil = localStorage.getItem(snoozeKey)
    if (snoozeUntil && Date.now() < parseInt(snoozeUntil)) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    if (ios) {
      // Sur iOS on affiche directement les instructions
      setShow(true)
    } else {
      // Sur Android/Chrome on attend l'event beforeinstallprompt
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setShow(true)
      }
      window.addEventListener('beforeinstallprompt', handler)

      // Si l'event a déjà été capturé avant ce composant
      const existing = (window as any).__pwaPrompt
      if (existing) {
        setDeferredPrompt(existing)
        setShow(true)
      }

      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [slug])

  function snooze() {
    localStorage.setItem(`pwa_snooze_${slug}`, String(Date.now() + 3 * 86400000))
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 z-[9998] rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: 'rgba(6,6,26,0.97)', border: '1px solid rgba(34,211,238,0.35)', boxShadow: '0 0 30px rgba(34,211,238,0.15)' }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icône */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)' }}>
            <span className="text-2xl">🚬</span>
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">{shopName}</p>
            <p className="text-slate-400 text-xs mt-0.5">
              Installez l'appli sur votre écran d'accueil pour un accès rapide à votre carte de fidélité !
            </p>
          </div>

          {/* Fermer */}
          <button onClick={snooze} className="text-slate-500 hover:text-white transition-colors shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          /* Instructions iOS */
          <div className="mt-3 bg-slate-800/60 rounded-xl p-3 space-y-2">
            <p className="text-slate-300 text-xs font-medium">Comment installer :</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <span>Appuyez sur le bouton</span>
              <Share className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-cyan-400 font-medium">Partager</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <span>Puis appuyez sur</span>
              <Plus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-cyan-400 font-medium">Sur l'écran d'accueil</span>
            </div>
            <button onClick={snooze}
              className="w-full mt-1 py-2 rounded-xl text-xs text-slate-400 border border-slate-700 hover:border-slate-600 transition-colors">
              Plus tard (3 jours)
            </button>
          </div>
        ) : (
          /* Bouton Android */
          <div className="mt-3 flex gap-2">
            <button onClick={install}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 12px rgba(34,211,238,0.2)' }}>
              <Download className="w-4 h-4" />
              Installer l'appli
            </button>
            <button onClick={snooze}
              className="px-4 py-2.5 rounded-xl text-xs text-slate-400 border border-slate-700 transition-colors">
              Plus tard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
