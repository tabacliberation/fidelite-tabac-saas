'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const N = 10
const ANGLE = 360 / N
const SVG_SIZE = 290
const CX = SVG_SIZE / 2
const CY = SVG_SIZE / 2
const R = 132

const SEGMENTS = [
  { label: 'Canette',  price: '1€50', emoji: '🥤', fill: '#0c4a6e', prize: 'canette'  },
  { label: 'Perdu',    price: '',     emoji: '💨', fill: '#0f172a', prize: null        },
  { label: 'Chocolat', price: '1€50', emoji: '🍫', fill: '#451a03', prize: 'chocolat'  },
  { label: 'Perdu',    price: '',     emoji: '💨', fill: '#0f172a', prize: null        },
  { label: 'Malabar',  price: '',     emoji: '🍭', fill: '#500724', prize: 'malabar'   },
  { label: 'Perdu',    price: '',     emoji: '💨', fill: '#0f172a', prize: null        },
  { label: 'Sourire',  price: '',     emoji: '😊', fill: '#1e3a1e', prize: 'sourire'   },
  { label: 'Perdu',    price: '',     emoji: '💨', fill: '#0f172a', prize: null        },
  { label: 'Bonbon',   price: '1€50', emoji: '🍬', fill: '#713f12', prize: 'bonbon'    },
  { label: 'ZIPPO',    price: '40€',  emoji: '🔥', fill: '#450a0a', prize: 'zippo'     },
]

const PRIZE_LABELS: Record<string, string> = {
  canette:  '1 Canette — 1€50 🥤',
  chocolat: '1 Barre chocolat — 1€50 🍫',
  malabar:  '1 Malabar 🍭',
  bonbon:   '1 Sachet de bonbon — 1€50 🍬',
  zippo:    '🔥 BRIQUET ZIPPO — 40€ 🔥',
}

function polar(angleDeg: number, r = R) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function segPath(i: number) {
  const a1 = i * ANGLE
  const a2 = (i + 1) * ANGLE
  const p1 = polar(a1)
  const p2 = polar(a2)
  return `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${R} ${R} 0 0 1 ${p2.x} ${p2.y} Z`
}

function getRandomPrize(): string | null {
  const r = Math.random() * 100
  if (r < 0.00009) return 'zippo'
  if (r < 0.50009) return 'bonbon'
  if (r < 1.00009) return 'malabar'
  if (r < 1.50009) return 'chocolat'
  if (r < 2.00009) return 'canette'
  if (r < 52.00009) return 'sourire'
  return null
}

function getSegIdx(prize: string | null): number {
  if (!prize) {
    const perdus = [1, 3, 5, 7]
    return perdus[Math.floor(Math.random() * perdus.length)]
  }
  const map: Record<string, number> = {
    canette: 0, chocolat: 2, malabar: 4, sourire: 6, bonbon: 8, zippo: 9,
  }
  return map[prize] ?? 1
}

function Confetti() {
  const items = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#22d3ee','#d946ef','#f59e0b','#4ade80','#f472b6','#fb923c','#a78bfa','#34d399'][i % 8],
    delay: Math.random() * 1.2,
    dur: 2.5 + Math.random() * 2,
    size: 5 + Math.random() * 9,
    round: Math.random() > 0.5,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {items.map(p => (
        <div key={p.id} className="confetti-fall"
          style={{ left: `${p.x}%`, top: '-20px', width: p.size, height: p.size, background: p.color, borderRadius: p.round ? '50%' : '3px', animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        />
      ))}
    </div>
  )
}

interface Props {
  slug: string
  onClose: () => void
}

export default function SpinWheelModal({ slug, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const spinKey = `last_spin_date_${slug}`
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const [prize, setPrize] = useState<string | null | undefined>(undefined)
  const [showConfetti, setShowConfetti] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    if (localStorage.getItem(spinKey) === today) setHasSpun(true)
    const stored = localStorage.getItem(`profile_${slug}`)
    if (stored) {
      try { setProfileId(JSON.parse(stored).id) } catch { setProfileId(null) }
    }
  }, [today, slug, spinKey])

  const handleSpin = () => {
    if (spinning || hasSpun || !profileId) return
    setSpinning(true)
    setTransitioning(true)

    const result = getRandomPrize()
    const idx = getSegIdx(result)
    const landAngle = 360 - (idx + 0.5) * ANGLE
    setRotation(360 * 6 + landAngle)

    setTimeout(() => {
      setPrize(result)
      setSpinning(false)
      setHasSpun(true)
      setTransitioning(false)
      localStorage.setItem(spinKey, today)
      if (result && result !== 'sourire') {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4500)
        fetch(`/api/${slug}/wheel-win`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId, prize: result }),
        }).catch(() => {})
      }
    }, 5000)
  }

  const isSourire = prize === 'sourire'
  const isWin = prize !== undefined && prize !== null && !isSourire
  const isLose = prize === null

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4"
        style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)' }}
      >
        <div className="w-full max-w-sm rounded-3xl relative overflow-hidden overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 2rem)', background: 'rgba(6,6,26,0.98)', border: '1px solid rgba(245,158,11,0.35)', boxShadow: '0 0 60px rgba(245,158,11,0.15), 0 0 120px rgba(245,158,11,0.05)' }}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-3 text-center relative" style={{ borderBottom: '1px solid rgba(245,158,11,0.12)' }}>
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full"
              style={{ color: '#475569', background: 'rgba(255,255,255,0.04)' }}
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-1" style={{ color: '#f59e0b' }}>✨ Programme Fidélité</p>
            <h2 className="text-xl font-black text-white">La Roue des Cadeaux</h2>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>1 tour gratuit par jour</p>
          </div>

          {/* Wheel zone */}
          <div className="flex flex-col items-center px-4 pt-5 pb-4">
            {/* Pointer */}
            <div className="relative z-10 mb-[-10px]">
              <div style={{ width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '26px solid #f59e0b', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.9))' }} />
            </div>

            {/* Wheel */}
            <div
              className={!spinning && !hasSpun ? 'wheel-idle' : ''}
              style={{ borderRadius: '50%', transform: `rotate(${rotation}deg)`, transition: transitioning ? 'transform 5s cubic-bezier(0.15, 0.5, 0.1, 1)' : 'none', border: '3px solid rgba(245,158,11,0.4)', width: 'min(290px, 82vw)', height: 'min(290px, 82vw)' }}
            >
              <svg width="100%" height="100%" viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
                {SEGMENTS.map((seg, i) => {
                  const centerAngle = (i + 0.5) * ANGLE
                  const tp = polar(centerAngle, 88)
                  const lp = polar(centerAngle, 112)
                  return (
                    <g key={i}>
                      <path d={segPath(i)} fill={seg.fill} stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                      <text x={tp.x} y={tp.y} textAnchor="middle" dominantBaseline="middle"
                        fontSize="17" transform={`rotate(${centerAngle}, ${tp.x}, ${tp.y})`} style={{ userSelect: 'none' }}
                      >{seg.emoji}</text>
                      <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
                        fontSize="6.5" fontWeight="bold" fill="rgba(255,255,255,0.6)"
                        transform={`rotate(${centerAngle}, ${lp.x}, ${lp.y})`}
                        style={{ userSelect: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        <tspan x={lp.x} dy={seg.price ? '-3' : '0'}>{seg.label}</tspan>
                        {seg.price && <tspan x={lp.x} dy="8" fill="rgba(255,220,100,0.9)" fontSize="6">{seg.price}</tspan>}
                      </text>
                      <line x1={CX} y1={CY} x2={polar(i * ANGLE).x} y2={polar(i * ANGLE).y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    </g>
                  )
                })}
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="2" />
                <circle cx={CX} cy={CY} r={R - 8} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <circle cx={CX} cy={CY} r={22} fill="rgba(6,6,26,1)" stroke="rgba(245,158,11,0.6)" strokeWidth="2.5" />
                <circle cx={CX} cy={CY} r={8} fill="#f59e0b" />
              </svg>
            </div>

            {/* Result */}
            <div className="w-full mt-5">
              {isWin && (
                <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)' }}>
                  <p className="text-xl font-black" style={{ color: '#f59e0b', textShadow: '0 0 16px #f59e0b' }}>🎉 Félicitations !</p>
                  <p className="font-black text-white text-lg mt-1">{PRIZE_LABELS[prize!]}</p>
                  <p className="text-xs mt-2" style={{ color: '#64748b' }}>Montrez cet écran au buraliste pour récupérer votre cadeau.</p>
                </div>
              )}
              {isSourire && (
                <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p className="text-2xl mb-1">😊</p>
                  <p className="text-lg font-black text-white">Sourire du vendeur !</p>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>Revenez demain pour un nouveau tour !</p>
                </div>
              )}
              {isLose && (
                <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <p className="text-lg font-black text-white">Pas de chance 😅</p>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>Revenez demain pour un nouveau tour !</p>
                </div>
              )}
              {hasSpun && prize === undefined && (
                <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}>
                  <p className="text-sm font-bold text-white">Déjà joué aujourd&apos;hui 😊</p>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>Revenez demain pour un nouveau tour !</p>
                </div>
              )}
            </div>

            {/* Button */}
            {!profileId ? (
              <div className="w-full mt-4 rounded-2xl p-4 text-center" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
                <p className="font-black text-white text-sm">Connexion requise 🔒</p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>Créez un compte pour jouer.</p>
              </div>
            ) : !hasSpun ? (
              <button onClick={handleSpin} disabled={spinning}
                className="w-full mt-4 py-4 rounded-2xl font-black text-lg disabled:opacity-70 transition-all active:scale-95"
                style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '2px solid rgba(245,158,11,0.6)', boxShadow: '0 0 24px rgba(245,158,11,0.3)' }}
              >
                {spinning ? '🌀 En cours...' : '🎰 LANCER LA ROUE !'}
              </button>
            ) : (
              <button onClick={onClose}
                className="w-full mt-4 py-3 rounded-2xl font-bold transition-all"
                style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }}
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
