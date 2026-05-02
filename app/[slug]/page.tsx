'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Coffee, Package, Smartphone, Gift, Star, Zap, ChevronRight, Sparkles, Bell, MapPin, Clock, LayoutDashboard, Cigarette, Shield } from 'lucide-react'
import Link from 'next/link'
import SpinWheelModal from '@/components/SpinWheelModal'

const iconMap: Record<string, React.ElementType> = {
  Coffee, Package, Smartphone, Gift, Star, Zap,
  coffee: Coffee, package: Package, smartphone: Smartphone, gift: Gift, star: Star, zap: Zap,
}

const NEONS = [
  { text: '#22d3ee', glow: 'rgba(34,211,238,0.5)',  border: 'rgba(34,211,238,0.35)', bg: 'rgba(34,211,238,0.07)'  },
  { text: '#d946ef', glow: 'rgba(217,70,239,0.5)',  border: 'rgba(217,70,239,0.35)', bg: 'rgba(217,70,239,0.07)'  },
  { text: '#8b5cf6', glow: 'rgba(139,92,246,0.5)',  border: 'rgba(139,92,246,0.35)', bg: 'rgba(139,92,246,0.07)'  },
  { text: '#34d399', glow: 'rgba(52,211,153,0.5)',  border: 'rgba(52,211,153,0.35)', bg: 'rgba(52,211,153,0.07)'  },
  { text: '#f472b6', glow: 'rgba(244,114,182,0.5)', border: 'rgba(244,114,182,0.35)', bg: 'rgba(244,114,182,0.07)' },
  { text: '#fb923c', glow: 'rgba(251,146,60,0.5)',  border: 'rgba(251,146,60,0.35)', bg: 'rgba(251,146,60,0.07)'  },
]

interface Offer {
  id: string; title: string; description: string | null
  required_points: number; reward: string | null; icon: string; image_url: string | null
}
interface SimpleOffer {
  id: string; title: string; description: string | null
  reward: string | null; icon: string; image_url: string | null
}
interface Shop {
  id: string; name: string; slug: string; address: string | null
  phone: string | null; hours: Record<string, string> | null; hero_image: string | null
}

// Football types
interface FootMatch {
  id: number
  competition: { name: string; code: string }
  utcDate: string
  status: string
  minute?: number
  homeTeam: { name: string; shortName?: string }
  awayTeam: { name: string; shortName?: string }
  score: { fullTime: { home: number | null; away: number | null } }
}

// PMU types
interface PmuCourse {
  numOrdre: number
  libelle: string
  heureDepart: number
  distance: number
  typeCourse: string
  nombreDeclaresPartants: number
}
interface PmuReunion {
  numOrdre: number
  hippodrome: { libelleLong: string; libelleCourt: string }
  courses: PmuCourse[]
}

const DAY_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const COMP_FLAGS: Record<string, string> = {
  'Ligue 1': '🇫🇷',
  'UEFA Champions League': '⭐',
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Bundesliga': '🇩🇪',
  'Serie A': '🇮🇹',
  'Primera Division': '🇪🇸',
  'Coupe de France': '🏆',
}

function OfferCard({ offer, neon, Icon, slug }: { offer: Offer; neon: typeof NEONS[0]; Icon: React.ElementType; slug: string }) {
  return (
    <Link href={`/${slug}/offers/${offer.id}`} className="rounded-2xl overflow-hidden flex flex-col active:scale-95 transition-transform"
      style={{ background: 'rgba(10,12,35,0.9)', border: `1px solid ${neon.border}`, boxShadow: `0 0 16px ${neon.bg}` }}
    >
      <div className="relative h-44">
        {offer.image_url ? (
          <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center neon-grid" style={{ background: 'rgba(6,6,26,0.95)' }}>
            <Icon className="w-14 h-14" style={{ color: neon.text, filter: `drop-shadow(0 0 12px ${neon.text})` }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,6,26,0.95) 0%, rgba(6,6,26,0.3) 50%, transparent 100%)' }} />
        <div className="absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[10px] font-black"
          style={{ background: 'rgba(6,6,26,0.8)', border: `1px solid ${neon.border}`, color: neon.text, boxShadow: `0 0 8px ${neon.glow}`, backdropFilter: 'blur(4px)' }}
        >
          ×{offer.required_points}
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
          <h3 className="font-black text-sm text-white leading-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{offer.title}</h3>
        </div>
      </div>
      <div className="px-3 py-2.5 flex-1 flex flex-col gap-1.5">
        <p className="text-slate-500 text-[11px] leading-snug line-clamp-2">{offer.description}</p>
        <div className="flex items-center gap-1.5 mt-auto">
          <Gift className="w-3 h-3 shrink-0" style={{ color: neon.text }} />
          <span className="text-[11px] font-bold" style={{ color: neon.text }}>{offer.reward}</span>
        </div>
      </div>
    </Link>
  )
}

type TabKey = 'offres' | 'jeux' | 'promo' | 'foot' | 'pmu' | 'tabacfrance'

export default function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [shop, setShop] = useState<Shop | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [simpleOffers, setSimpleOffers] = useState<SimpleOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [simpleLoading, setSimpleLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('offres')
  const [showWheel, setShowWheel] = useState(false)
  const offersRef = useRef<HTMLDivElement>(null)

  // Football state
  const [footballData, setFootballData] = useState<{ matches: FootMatch[]; noKey?: boolean; error?: string } | null>(null)
  const [footballLoading, setFootballLoading] = useState(false)

  // PMU state
  const [pmuData, setPmuData] = useState<{ reunions: PmuReunion[]; error?: string } | null>(null)
  const [pmuLoading, setPmuLoading] = useState(false)

  useEffect(() => {
    params.then(({ slug: s }) => {
      setSlug(s)
      setIsLoggedIn(!!localStorage.getItem(`profile_${s}`))
      supabase.from('shops').select('*').eq('slug', s).single()
        .then(({ data: shopRow }) => {
          if (shopRow) {
            setShop(shopRow)
            supabase.from('offers').select('*').eq('shop_id', shopRow.id).eq('is_active', true)
              .then(({ data }) => { if (data) setOffers(data); setLoading(false) })
            setSimpleLoading(true)
            supabase.from('simple_offers').select('*').eq('shop_id', shopRow.id).eq('is_active', true)
              .then(({ data }) => { if (data) setSimpleOffers(data); setSimpleLoading(false) })
          } else { setLoading(false) }
        })
    })
  }, [params])

  // Lazy-load football & PMU only when tab is clicked
  useEffect(() => {
    if (activeTab === 'foot' && !footballData && !footballLoading) {
      setFootballLoading(true)
      fetch('/api/football').then(r => r.json()).then(setFootballData).finally(() => setFootballLoading(false))
    }
    if (activeTab === 'pmu' && !pmuData && !pmuLoading) {
      setPmuLoading(true)
      fetch('/api/pmu').then(r => r.json()).then(setPmuData).finally(() => setPmuLoading(false))
    }
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const DEFAULT_HOURS: Record<string, string> = {
    'Lundi': '06:00 – 19:30', 'Mardi': '06:00 – 19:30', 'Mercredi': '06:00 – 19:30',
    'Jeudi': '06:00 – 19:30', 'Vendredi': '06:00 – 19:30', 'Samedi': '07:30 – 19:30', 'Dimanche': 'Fermé',
  }
  const hours = shop?.hours ?? DEFAULT_HOURS

  return (
    <div className="min-h-screen flex flex-col pb-20 neon-grid" style={{ background: '#06061a' }}>
      <div className="scan-line" />

      {/* ── HERO ── */}
      <section className="relative min-h-[62vh] flex flex-col justify-end overflow-hidden">
        {shop?.hero_image ? (
          <>
            <img src={shop.hero_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #06061a 0%, rgba(6,6,26,0.55) 50%, rgba(6,6,26,0.2) 100%)' }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(6,6,26,1) 60%, rgba(217,70,239,0.08) 100%)' }} />
            <div className="absolute inset-0 neon-grid" style={{ background: '#06061a' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #06061a 0%, rgba(6,6,26,0.6) 50%, rgba(6,6,26,0.25) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.06) 0%, transparent 50%, rgba(217,70,239,0.06) 100%)' }} />
          </>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 hero-top-pad">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.5)', boxShadow: '0 0 12px rgba(34,211,238,0.3)' }}
            >
              <Cigarette className="w-5 h-5" style={{ color: '#22d3ee', filter: 'drop-shadow(0 0 4px #22d3ee)' }} />
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">Bureau Tabac</p>
              <p className="text-xs font-bold tracking-[0.2em] uppercase neon-cyan">{shop?.name ?? '...'}</p>
            </div>
          </div>
          {isLoggedIn ? (
            <button onClick={() => router.push(`/${slug}/dashboard`)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl neon-btn"
              style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.5)', color: '#22d3ee' }}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Mon espace
            </button>
          ) : (
            <button onClick={() => router.push(`/${slug}/admin`)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
              style={{ background: 'rgba(217,70,239,0.12)', border: '1px solid rgba(217,70,239,0.4)', color: '#d946ef' }}
            >
              <Shield className="w-3.5 h-3.5" /> Admin
            </button>
          )}
        </div>

        {/* Hero content */}
        <div className="relative px-5 pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4"
            style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}
          >
            <Sparkles className="w-3 h-3" style={{ color: '#22d3ee' }} />
            <span className="text-xs font-bold neon-cyan">Programme fidélité 100% gratuit</span>
          </div>
          <h1 className="text-[1.85rem] sm:text-[2.4rem] font-black leading-none mb-3 text-white">
            Gagnez des<br />
            <span className="neon-cyan">récompenses</span><br />
            à chaque achat
          </h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-xs">
            Cumulez des tampons, débloquez des cadeaux. Sans carte papier, sans email.
          </p>
          {isLoggedIn ? (
            <button onClick={() => router.push(`/${slug}/dashboard`)}
              className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 neon-btn"
              style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.5)', color: '#22d3ee' }}
            >
              <LayoutDashboard className="w-4 h-4" /> Voir mes cartes fidélité
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => router.push(`/${slug}/register`)}
                className="flex-1 font-black py-4 rounded-2xl flex items-center justify-center gap-1.5 neon-btn active:scale-95 transition-transform"
                style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.6)', color: '#22d3ee' }}
              >
                <Sparkles className="w-4 h-4" /> Rejoindre
              </button>
              <button onClick={() => offersRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-1 font-semibold py-4 rounded-2xl flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.4)', color: '#d946ef' }}
              >
                Les offres <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="flex" style={{ borderTop: '1px solid rgba(34,211,238,0.15)', borderBottom: '1px solid rgba(34,211,238,0.15)', background: 'rgba(10,12,35,0.8)' }}>
        {[
          { value: `${offers.length || '—'}`, label: 'Offres actives',  color: '#22d3ee' },
          { value: '∞',                        label: 'Sans expiration', color: '#d946ef' },
          { value: 'Push',                     label: 'Notifications',   color: '#8b5cf6' },
        ].map(({ value, label, color }, i) => (
          <div key={label} className="flex-1 flex flex-col items-center py-4"
            style={{ borderRight: i < 2 ? '1px solid rgba(34,211,238,0.1)' : 'none' }}
          >
            <span className="font-black text-xl" style={{ color, textShadow: `0 0 10px ${color}` }}>{value}</span>
            <span className="text-[11px] mt-0.5 font-medium text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div ref={offersRef} className="sticky top-0 z-10"
        style={{ background: 'rgba(6,6,26,0.95)', backdropFilter: 'blur(12px)' }}
      >
        {/* Rangée 1 : Offres / Jeux / Promos */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(34,211,238,0.1)' }}>
          {([
            { key: 'offres', label: 'Nos Offres', Icon: Gift     },
            { key: 'jeux',   label: 'Mes Jeux',   Icon: Star     },
            { key: 'promo',  label: 'Promos',     Icon: Sparkles },
          ] as const).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex-1 py-3 text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
              style={activeTab === key
                ? { color: '#22d3ee', borderBottom: '2px solid #22d3ee', textShadow: '0 0 8px #22d3ee' }
                : { color: '#475569', borderBottom: '2px solid transparent' }
              }
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Rangée 2 : Foot / PMU / TabacFrance */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(34,211,238,0.08)', background: 'rgba(6,6,26,0.98)' }}>
          {([
            { key: 'foot',        emoji: '⚽', label: 'Foot',        color: '#22d3ee' },
            { key: 'pmu',         emoji: '🏇', label: 'PMU',         color: '#d946ef' },
            { key: 'tabacfrance', emoji: '🚬', label: 'TabacFrance', color: '#f59e0b' },
          ] as const).map(({ key, emoji, label, color }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex-1 py-2 flex items-center justify-center gap-1 text-xs font-black transition-all"
              style={activeTab === key
                ? { color, borderBottom: `2px solid ${color}`, textShadow: `0 0 6px ${color}` }
                : { color: '#334155', borderBottom: '2px solid transparent' }
              }
            >
              <span style={{ fontSize: 13 }}>{emoji}</span>{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OFFRES ── */}
      {activeTab === 'offres' && (
        <div className="flex-1 px-4 pt-5">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)' }} />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-slate-500">
              <Gift className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Aucune offre disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {offers.map((offer, i) => (
                <OfferCard key={offer.id} offer={offer} neon={NEONS[i % NEONS.length]} Icon={iconMap[offer.icon] ?? Gift} slug={slug} />
              ))}
            </div>
          )}

          <div className="mt-5 rounded-2xl p-5 neon-card">
            <p className="text-white font-bold mb-4 text-sm neon-cyan">Pourquoi nous rejoindre ?</p>
            <div className="space-y-3">
              {[
                { icon: Sparkles, text: 'Inscription en 30 secondes, sans email',          color: '#22d3ee' },
                { icon: Bell,     text: 'Promos et cadeau anniversaire par notification',   color: '#d946ef' },
                { icon: Gift,     text: "Récompenses sans date d'expiration",               color: '#8b5cf6' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}40` }}
                  >
                    <Icon className="w-4 h-4" style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} />
                  </div>
                  <span className="text-slate-300 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-2xl p-5 neon-card mb-4">
            <p className="text-white font-bold mb-3 text-sm neon-cyan">Nous trouver</p>
            {shop?.address && (
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm leading-snug">{shop.address}</span>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-sm" style={{ color: '#94a3b8' }}>
                <p className="font-bold text-white mb-1">Horaires</p>
                {DAY_ORDER.map(day => {
                  const h = hours[day] ?? DEFAULT_HOURS[day]
                  return (
                    <div key={day} className="flex justify-between gap-4">
                      <span style={{ color: h === 'Fermé' ? '#ef4444' : '#94a3b8' }}>{day}</span>
                      <span style={{ color: h === 'Fermé' ? '#ef4444' : '#cbd5e1' }}>{h}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {!isLoggedIn && (
            <button onClick={() => router.push(`/${slug}/register`)}
              className="w-full font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 mb-4 neon-btn"
              style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.5)', color: '#22d3ee' }}
            >
              <Sparkles className="w-5 h-5" /> Créer mon compte gratuit
            </button>
          )}
        </div>
      )}

      {/* ── JEUX ── */}
      {activeTab === 'jeux' && (
        <div className="flex-1 flex flex-col items-center px-5 py-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', boxShadow: '0 0 30px rgba(245,158,11,0.2)' }}
          >
            <span className="text-4xl">🎰</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">La Roue des Cadeaux</h2>
          <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed mb-6">
            Tentez votre chance chaque jour ! Canette, chocolat, Malabar... et peut-être un{' '}
            <span style={{ color: '#f59e0b' }} className="font-bold">Briquet Zippo à 40€</span> !
          </p>
          <div className="w-full space-y-2 mb-6">
            {[
              { emoji: '🥤', label: '1 Canette — 1€50',         color: '#22d3ee' },
              { emoji: '🍫', label: '1 Barre chocolat — 1€50',  color: '#d97706' },
              { emoji: '🍭', label: '1 Malabar',                 color: '#ec4899' },
              { emoji: '😊', label: 'Sourire du vendeur',        color: '#4ade80' },
              { emoji: '🍬', label: '1 Sachet de bonbon — 1€50', color: '#f59e0b' },
              { emoji: '🔥', label: 'Briquet Zippo — 40€',       color: '#ef4444' },
            ].map(({ emoji, label, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(10,12,35,0.8)', border: `1px solid ${color}20` }}
              >
                <span className="text-lg">{emoji}</span>
                <span className="flex-1 text-sm text-white font-medium">{label}</span>
              </div>
            ))}
          </div>
          {!isLoggedIn ? (
            <button onClick={() => router.push(`/${slug}/register`)}
              className="w-full py-4 rounded-2xl font-black text-lg neon-btn"
              style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.5)' }}
            >
              Créer mon compte pour jouer
            </button>
          ) : (
            <button onClick={() => setShowWheel(true)}
              className="w-full py-4 rounded-2xl font-black text-xl transition-all active:scale-95"
              style={{ background: 'rgba(245,158,11,0.18)', color: '#f59e0b', border: '2px solid rgba(245,158,11,0.55)', boxShadow: '0 0 24px rgba(245,158,11,0.25)' }}
            >
              🎰 LANCER LA ROUE !
            </button>
          )}
        </div>
      )}

      {/* ── PROMOS ── */}
      {activeTab === 'promo' && (
        <div className="flex-1 px-4 pt-5 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#d946ef' }}>
            Offres &amp; Promotions
          </p>
          {simpleLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(217,70,239,0.05)' }} />)}
            </div>
          ) : simpleOffers.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-slate-500">
              <Sparkles className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Aucune promotion en cours</p>
            </div>
          ) : (
            <div className="space-y-3">
              {simpleOffers.map((offer, i) => {
                const neon = NEONS[i % NEONS.length]
                const Icon = iconMap[offer.icon] ?? Gift
                return (
                  <div key={offer.id} className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(10,12,35,0.9)', border: `1px solid ${neon.border}`, boxShadow: `0 0 16px ${neon.bg}` }}
                  >
                    {offer.image_url && (
                      <div className="relative w-full h-36">
                        <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: neon.bg, border: `1px solid ${neon.border}` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: neon.text, filter: `drop-shadow(0 0 4px ${neon.text})` }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-white text-sm">{offer.title}</p>
                        {offer.description && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{offer.description}</p>}
                        {offer.reward && <p className="text-xs font-bold mt-1.5" style={{ color: neon.text }}>🎁 {offer.reward}</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── FOOT ── */}
      {activeTab === 'foot' && (
        <div className="flex-1 px-4 pt-5 pb-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}>
              <span className="text-2xl">⚽</span>
            </div>
            <div className="flex-1">
              <h2 className="font-black text-white">Foot en direct</h2>
              <p className="text-xs" style={{ color: '#475569' }}>Scores & matchs à venir</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </div>
          </div>

          {/* Skeleton */}
          {footballLoading && (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.08)' }} />
              ))}
            </div>
          )}

          {/* Pas de clé API configurée */}
          {!footballLoading && footballData?.noKey && (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">⚽</span>
              <p className="font-black text-white mb-2">Scores en direct bientôt disponibles</p>
              <p className="text-sm" style={{ color: '#475569' }}>Nos partenaires activent les données en ce moment</p>
            </div>
          )}

          {/* Erreur */}
          {!footballLoading && footballData?.error && !footballData.noKey && (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">📡</span>
              <p className="font-black text-white mb-2">Connexion au service</p>
              <button
                onClick={() => { setFootballData(null); setFootballLoading(true); fetch('/api/football').then(r => r.json()).then(setFootballData).finally(() => setFootballLoading(false)) }}
                className="mt-3 text-xs px-4 py-2 rounded-xl font-bold"
                style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }}>
                Réessayer
              </button>
            </div>
          )}

          {/* Aucun match */}
          {!footballLoading && footballData && !footballData.error && !footballData.noKey && footballData.matches.length === 0 && (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">😴</span>
              <p className="font-black text-white mb-1">Aucun match aujourd&apos;hui</p>
              <p className="text-sm" style={{ color: '#475569' }}>Revenez demain pour les prochaines rencontres</p>
            </div>
          )}

          {/* Matchs groupés par compétition */}
          {!footballLoading && footballData?.matches && footballData.matches.length > 0 && (() => {
            const byComp: Record<string, FootMatch[]> = {}
            footballData.matches.forEach(m => {
              const k = m.competition.name
              if (!byComp[k]) byComp[k] = []
              byComp[k].push(m)
            })
            return Object.entries(byComp).map(([compName, matches]) => (
              <div key={compName} className="mb-5">
                {/* Compétition header */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-base">{COMP_FLAGS[compName] ?? '🏆'}</span>
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#64748b' }}>{compName}</span>
                </div>
                <div className="space-y-2">
                  {matches.map(match => {
                    const isLive     = ['IN_PLAY', 'PAUSED'].includes(match.status)
                    const isHalf     = match.status === 'HALFTIME'
                    const isFinished = match.status === 'FINISHED'
                    const anyLive    = isLive || isHalf
                    const localTime  = new Date(match.utcDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    const hs = match.score.fullTime.home
                    const as_ = match.score.fullTime.away
                    const homeName = match.homeTeam.shortName ?? match.homeTeam.name
                    const awayName = match.awayTeam.shortName ?? match.awayTeam.name
                    return (
                      <div key={match.id} className="rounded-xl px-3 py-3 flex items-center gap-3"
                        style={{
                          background: anyLive ? 'rgba(239,68,68,0.06)' : 'rgba(10,12,35,0.85)',
                          border: anyLive ? '1px solid rgba(239,68,68,0.22)' : '1px solid rgba(255,255,255,0.06)',
                        }}>
                        {/* Heure / statut */}
                        <div className="w-16 shrink-0 text-center">
                          {anyLive ? (
                            <div>
                              <div className="flex items-center justify-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] font-black text-red-400">LIVE</span>
                              </div>
                              <span className="text-[9px] text-red-300 block">{isHalf ? 'Mi-temps' : `${match.minute}'`}</span>
                            </div>
                          ) : isFinished ? (
                            <span className="text-[10px] text-slate-600 font-bold">FIN</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">{localTime}</span>
                          )}
                        </div>

                        {/* Équipes + score */}
                        <div className="flex-1 flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white flex-1 truncate">{homeName}</span>
                          <div className="shrink-0 min-w-[48px] text-center">
                            {(anyLive || isFinished) && hs !== null && as_ !== null ? (
                              <span className="text-base font-black" style={{ color: anyLive ? '#ef4444' : '#94a3b8' }}>
                                {hs} - {as_}
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs">vs</span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-white flex-1 truncate text-right">{awayName}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          })()}

          <p className="text-center text-[10px] mt-6" style={{ color: '#1e293b' }}>
            Données football-data.org · Mise à jour toutes les minutes
          </p>
        </div>
      )}

      {/* ── PMU ── */}
      {activeTab === 'pmu' && (
        <div className="flex-1 px-4 pt-5 pb-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.3)' }}>
              <span className="text-2xl">🏇</span>
            </div>
            <div>
              <h2 className="font-black text-white">PMU — Courses du jour</h2>
              <p className="text-xs" style={{ color: '#475569' }}>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {/* Skeleton */}
          {pmuLoading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'rgba(217,70,239,0.04)', border: '1px solid rgba(217,70,239,0.1)' }} />
              ))}
            </div>
          )}

          {/* Erreur / vide / indisponible */}
          {!pmuLoading && pmuData && (pmuData.reunions?.length === 0) && (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🏇</span>
              <p className="font-black text-white mb-1">
                {(pmuData as {unavailable?: boolean}).unavailable
                  ? 'Programme PMU indisponible depuis l\'étranger'
                  : 'Aucune course programmée aujourd\'hui'}
              </p>
              <p className="text-sm mt-1" style={{ color: '#475569' }}>
                {(pmuData as {unavailable?: boolean}).unavailable
                  ? 'Consultez pmu.fr pour le programme complet'
                  : 'Revenez demain pour les prochaines courses'}
              </p>
              {(pmuData as {unavailable?: boolean}).unavailable && (
                <a href="https://www.pmu.fr/turf/programme-des-courses" target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold"
                  style={{ background: 'rgba(217,70,239,0.1)', color: '#d946ef', border: '1px solid rgba(217,70,239,0.25)' }}>
                  Voir sur pmu.fr →
                </a>
              )}
            </div>
          )}

          {/* Réunions */}
          {!pmuLoading && pmuData?.reunions && pmuData.reunions.length > 0 && (
            <div className="space-y-4">
              {pmuData.reunions.map((reunion) => (
                <div key={reunion.numOrdre} className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(10,12,35,0.85)', border: '1px solid rgba(217,70,239,0.2)' }}>
                  {/* Hippodrome header */}
                  <div className="px-4 py-3 flex items-center gap-3"
                    style={{ background: 'rgba(217,70,239,0.06)', borderBottom: '1px solid rgba(217,70,239,0.12)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(217,70,239,0.12)', border: '1px solid rgba(217,70,239,0.25)' }}>
                      <span className="text-sm font-black" style={{ color: '#d946ef' }}>R{reunion.numOrdre}</span>
                    </div>
                    <div>
                      <p className="font-black text-white text-sm">
                        {reunion.hippodrome?.libelleLong ?? reunion.hippodrome?.libelleCourt ?? 'Hippodrome'}
                      </p>
                      <p className="text-[10px]" style={{ color: '#d946ef' }}>
                        {reunion.courses?.length ?? 0} course{(reunion.courses?.length ?? 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Liste des courses */}
                  <div>
                    {reunion.courses?.map((course, ci) => {
                      const dept = new Date(course.heureDepart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      const isNow = Math.abs(new Date(course.heureDepart).getTime() - Date.now()) < 15 * 60 * 1000
                      const typeColors: Record<string, string> = {
                        PLAT: '#22d3ee', TROT: '#f59e0b', OBSTACLE: '#34d399', ATTELE: '#f59e0b', MONTE: '#8b5cf6',
                      }
                      const typeLabels: Record<string, string> = {
                        PLAT: 'Plat', TROT: 'Trot', OBSTACLE: 'Obstacle', ATTELE: 'Attelé', MONTE: 'Monté',
                      }
                      const tc = course.typeCourse ?? 'PLAT'
                      const color = typeColors[tc] ?? '#94a3b8'
                      const label = typeLabels[tc] ?? tc
                      return (
                        <div key={ci}
                          className="px-4 py-2.5 flex items-center gap-3"
                          style={{
                            borderTop: ci > 0 ? '1px solid rgba(217,70,239,0.07)' : 'none',
                            background: isNow ? 'rgba(217,70,239,0.05)' : 'transparent',
                          }}>
                          {/* Heure */}
                          <div className="w-12 shrink-0">
                            {isNow ? (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#d946ef' }} />
                                <span className="text-[10px] font-black" style={{ color: '#d946ef' }}>{dept}</span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold" style={{ color: '#64748b' }}>{dept}</span>
                            )}
                          </div>

                          {/* Infos course */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              C{course.numOrdre} — {course.libelle}
                            </p>
                            <p className="text-[10px]" style={{ color: '#475569' }}>
                              {course.distance ? `${course.distance}m` : ''}{course.nombreDeclaresPartants ? ` · ${course.nombreDeclaresPartants} partants` : ''}
                            </p>
                          </div>

                          {/* Type badge */}
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0"
                            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                            {label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              <p className="text-center text-[10px] mt-2" style={{ color: '#1e293b' }}>
                Données PMU · Programme officiel du jour
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TABACFRANCE ── */}
      {activeTab === 'tabacfrance' && (
        <div className="flex-1 px-4 pt-6 pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2 rounded-2xl px-5 py-3"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 0 30px rgba(245,158,11,0.1)' }}
            >
              <span className="text-3xl">🚬</span>
              <div className="text-left">
                <p className="font-black text-white text-base leading-none">TABAC<span style={{ color: '#f59e0b' }}>FRANCE</span></p>
                <p className="text-xs mt-0.5" style={{ color: '#78350f' }}>Plateforme fidélité pour buralistes</p>
              </div>
            </div>
          </div>
          <p className="text-center text-sm mb-6 leading-relaxed" style={{ color: '#94a3b8' }}>
            L&apos;application que vous utilisez est propulsée par{' '}
            <span className="font-bold" style={{ color: '#f59e0b' }}>TabacFrance</span>.
            Une solution complète de fidélité numérique conçue pour les buralistes.
          </p>
          <div className="space-y-3 mb-6">
            {[
              { emoji: '📱', title: 'Application mobile',     desc: 'Votre vitrine numérique, cartes fidélité, roue des cadeaux', color: '#22d3ee' },
              { emoji: '🎯', title: 'Tampons sans contact',   desc: 'Code PIN en caisse, validation instantanée sans carte papier', color: '#d946ef' },
              { emoji: '🔔', title: 'Notifications push',     desc: 'Envoyez des promos ciblées directement sur le téléphone', color: '#8b5cf6' },
              { emoji: '📊', title: 'Tableau de bord admin',  desc: 'Gérez vos clients, offres et statistiques depuis votre téléphone', color: '#34d399' },
              { emoji: '🎰', title: 'Roue des cadeaux',       desc: 'Fidélisez avec un jeu quotidien — canette, zippo, chocolat...', color: '#f59e0b' },
              { emoji: '🖨️', title: 'Affiche A4 imprimable',  desc: 'QR code et toutes vos offres générés automatiquement', color: '#f472b6' },
            ].map(({ emoji, title, desc, color }) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
                style={{ background: 'rgba(10,12,35,0.8)', border: `1px solid ${color}20` }}
              >
                <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-5 mb-5 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.35)', boxShadow: '0 0 30px rgba(245,158,11,0.08)' }}
          >
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#f59e0b' }}>Vous êtes buraliste ?</p>
            <p className="text-2xl font-black text-white mb-1">
              À partir de <span style={{ color: '#f59e0b' }}>19,90€</span>
              <span className="text-sm font-normal text-slate-400">/mois</span>
            </p>
            <p className="text-xs mb-4" style={{ color: '#64748b' }}>14 jours d&apos;essai gratuit · Sans engagement · Support inclus</p>
            <a href="/" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 font-black py-3 px-6 rounded-xl text-sm transition-all"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.5)', boxShadow: '0 0 16px rgba(245,158,11,0.15)' }}
            >
              Découvrir TabacFrance →
            </a>
          </div>
          <p className="text-center text-xs" style={{ color: '#334155' }}>
            Cette vitrine appartient à <span className="font-bold" style={{ color: '#475569' }}>{shop?.name ?? slug}</span><br />
            Développé avec ❤️ par TabacFrance
          </p>
        </div>
      )}

      {/* ── ROUE MODAL ── */}
      {showWheel && <SpinWheelModal slug={slug} onClose={() => setShowWheel(false)} />}
    </div>
  )
}
