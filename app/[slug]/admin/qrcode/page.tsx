'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const NEONS = ['#22d3ee', '#d946ef', '#8b5cf6', '#34d399', '#f472b6', '#fb923c', '#f59e0b', '#4ade80']

const iconEmoji: Record<string, string> = {
  coffee: '☕', Coffee: '☕', package: '📦', Package: '📦',
  smartphone: '📱', Smartphone: '📱', gift: '🎁', Gift: '🎁',
  star: '⭐', Star: '⭐', zap: '⚡', Zap: '⚡',
}

interface Offer {
  id: string
  title: string
  description?: string
  reward: string
  required_points: number
  image_url?: string
  icon?: string
}

interface SimpleOffer {
  id: string
  title: string
  description?: string
  reward?: string
  image_url?: string
  icon?: string
}

export default function QRCodePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [shopName, setShopName] = useState('')
  const [address, setAddress] = useState('')
  const [appUrl, setAppUrl] = useState('')
  const [offers, setOffers] = useState<Offer[]>([])
  const [simpleOffers, setSimpleOffers] = useState<SimpleOffer[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(`admin_${slug}`)) { router.push(`/${slug}/admin`); return }
    const base = window.location.origin
    setAppUrl(`${base}/${slug}`)

    Promise.all([
      fetch(`/api/${slug}/admin/settings`).then(r => r.json()),
      fetch(`/api/${slug}/admin/offers`).then(r => r.json()),
      fetch(`/api/${slug}/admin/simple-offers`).then(r => r.json()),
    ]).then(([settings, offersData, simpleData]) => {
      setShopName(settings.shopName || slug)
      setAddress(settings.address || '')
      const rawOffers = offersData?.offers ?? offersData
      const rawSimple = simpleData?.offers ?? simpleData
      setOffers(Array.isArray(rawOffers) ? rawOffers.filter((o: Offer) => o) : [])
      setSimpleOffers(Array.isArray(rawSimple) ? rawSimple.filter((o: SimpleOffer) => o) : [])
    })
  }, [slug, router])

  const handlePrint = () => window.print()

  const handleDownload = async () => {
    setSaving(true)
    try {
      const h2c = (await import('html2canvas')).default
      const poster = document.getElementById('poster')!
      const canvas = await h2c(poster, { scale: 3, useCORS: true, backgroundColor: '#06061a', logging: false })
      const link = document.createElement('a')
      link.download = `affiche-${slug}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
    } finally {
      setSaving(false)
    }
  }

  const qrApiUrl = appUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(appUrl)}&bgcolor=ffffff&color=06061a&margin=2`
    : ''

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        .star-bg {
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
          .poster { box-shadow: none !important; margin: 0 !important; width: 210mm !important; min-height: 297mm !important; border-radius: 0 !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      {/* Admin header */}
      <div className="no-print min-h-screen neon-grid" style={{ background: '#06061a' }}>
        <div className="px-5 pb-5 page-top-pad" style={{ background: 'rgba(10,12,35,0.9)', borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} style={{ color: '#475569' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black text-white">
              QR <span style={{ color: '#22d3ee', textShadow: '0 0 8px #22d3ee' }}>Code</span>
            </h1>
          </div>
        </div>

        <div className="px-5 py-6 flex flex-col items-center gap-4">
          {/* Quick QR for scanning */}
          {appUrl && (
            <div className="rounded-3xl p-6 flex flex-col items-center gap-3" style={{ background: 'white', boxShadow: '0 0 40px rgba(34,211,238,0.15)' }}>
              <img src={qrApiUrl} alt="QR Code" className="w-48 h-48" />
              <div className="text-center">
                <p className="text-black font-black text-lg">{shopName || slug}</p>
                <p className="text-gray-500 text-sm">Scannez pour rejoindre</p>
              </div>
            </div>
          )}

          <p className="text-xs text-center" style={{ color: '#475569' }}>
            Lien : <span style={{ color: '#22d3ee' }}>{appUrl}</span>
          </p>

          <div className="flex gap-3 w-full max-w-sm">
            <button onClick={handlePrint}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}
            >
              🖨️ Imprimer
            </button>
            <button onClick={handleDownload} disabled={saving}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 hidden md:block"
              style={{ background: 'rgba(217,70,239,0.1)', color: '#d946ef', border: '1px solid rgba(217,70,239,0.3)' }}
            >
              {saving ? '⏳...' : '🖼️ Télécharger'}
            </button>
          </div>

          <div className="rounded-2xl p-4 w-full max-w-sm text-sm" style={{ background: 'rgba(34,211,238,0.03)', border: '1px solid rgba(34,211,238,0.12)', color: '#475569' }}>
            <p className="font-bold text-white mb-1 text-xs">Comment utiliser ce QR code ?</p>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Imprimez-le et affichez-le en caisse</li>
              <li>Vos clients le scannent avec leur téléphone</li>
              <li>Ils s&apos;inscrivent en 30 secondes</li>
              <li>L&apos;affiche complète inclut toutes vos offres</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Message mobile */}
      <div className="no-print md:hidden px-5 pb-6">
        <div className="rounded-2xl p-4 text-sm text-center" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)', color: '#475569' }}>
          <p className="text-white font-bold mb-1">🖨️ Affiche A4</p>
          <p className="text-xs">Ouvrez cette page sur un ordinateur pour prévisualiser et imprimer l&apos;affiche complète avec vos offres.</p>
        </div>
      </div>

      {/* Printable A4 poster */}
      <div id="poster" className="poster mx-auto hidden md:flex"
        style={{
          width: '210mm', minHeight: '297mm', background: '#06061a',
          fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
          boxShadow: '0 0 60px rgba(34,211,238,0.15)', marginBottom: '2rem',
          padding: '10mm 10mm 8mm', display: 'flex', flexDirection: 'column',
        }}
      >
        <div className="star-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-40mm', left: '-20mm', width: '80mm', height: '80mm', borderRadius: '50%', background: 'rgba(34,211,238,0.06)', filter: 'blur(30mm)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20mm', right: '-20mm', width: '70mm', height: '70mm', borderRadius: '50%', background: 'rgba(217,70,239,0.06)', filter: 'blur(25mm)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8mm', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3mm', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '4mm', padding: '3mm 6mm', marginBottom: '4mm' }}>
            <span style={{ fontSize: '7mm' }}>🚬</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '4mm', fontWeight: 900, color: '#22d3ee', letterSpacing: '0.3em', textTransform: 'uppercase', textShadow: '0 0 6mm rgba(34,211,238,0.8)' }}>Bureau Tabac</div>
              <div style={{ fontSize: '9mm', fontWeight: 900, color: '#ffffff', letterSpacing: '0.15em' }}>{shopName || slug}</div>
            </div>
          </div>
          <div style={{ fontSize: '8mm', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, marginBottom: '2mm' }}>
            Programme de<br />
            <span style={{ color: '#22d3ee', textShadow: '0 0 8mm rgba(34,211,238,0.9)' }}>Fidélité</span>
          </div>
          {address && <div style={{ fontSize: '3.5mm', color: '#64748b', letterSpacing: '0.1em' }}>{address}</div>}
          <div style={{ width: '30mm', height: '0.3mm', background: 'linear-gradient(to right, transparent, #22d3ee, transparent)', margin: '3mm auto 0' }} />
        </div>

        {/* Stamp offers */}
        {offers.length > 0 && (
          <div style={{ marginBottom: '6mm' }}>
            <div style={{ fontSize: '3mm', fontWeight: 900, color: '#22d3ee', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '3mm', textAlign: 'center' }}>
              ✦ Cartes de fidélité ✦
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: offers.length === 1 ? '1fr' : '1fr 1fr', gap: '3mm' }}>
              {offers.map((offer, i) => {
                const neon = NEONS[i % NEONS.length]
                const emoji = iconEmoji[offer.icon ?? ''] ?? '🎁'
                return (
                  <div key={offer.id} style={{ background: 'rgba(10,12,35,0.95)', border: `1px solid ${neon}40`, borderRadius: '3mm', padding: '3.5mm', display: 'flex', gap: '3mm', alignItems: 'flex-start' }}>
                    {offer.image_url ? (
                      <div style={{ width: '16mm', height: '16mm', borderRadius: '2mm', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={offer.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: '12mm', height: '12mm', borderRadius: '2mm', background: `${neon}15`, border: `1px solid ${neon}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5mm', flexShrink: 0 }}>
                        {emoji}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '3.5mm', fontWeight: 900, color: '#ffffff', marginBottom: '1mm' }}>{offer.title}</div>
                      {offer.description && <div style={{ fontSize: '2.8mm', color: '#64748b', marginBottom: '1.5mm', lineHeight: 1.3 }}>{offer.description}</div>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1mm' }}>
                        <div style={{ display: 'flex', gap: '1mm', flexWrap: 'wrap' }}>
                          {Array.from({ length: Math.min(offer.required_points, 12) }).map((_, j) => (
                            <div key={j} style={{ width: '3.5mm', height: '3.5mm', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${neon}50` }} />
                          ))}
                          {offer.required_points > 12 && <span style={{ fontSize: '2.5mm', color: '#64748b' }}>+{offer.required_points - 12}</span>}
                        </div>
                        <div style={{ fontSize: '2.8mm', fontWeight: 900, color: neon, background: `${neon}15`, border: `0.5px solid ${neon}40`, borderRadius: '1.5mm', padding: '0.8mm 2mm', textShadow: `0 0 4mm ${neon}` }}>
                          🎁 {offer.reward}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Simple offers */}
        {simpleOffers.length > 0 && (
          <div style={{ marginBottom: '6mm' }}>
            <div style={{ fontSize: '3mm', fontWeight: 900, color: '#d946ef', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '3mm', textAlign: 'center' }}>
              ✦ Offres &amp; Promotions ✦
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: simpleOffers.length === 1 ? '1fr' : '1fr 1fr', gap: '3mm' }}>
              {simpleOffers.map((offer, i) => {
                const neon = NEONS[(offers.length + i) % NEONS.length]
                const emoji = iconEmoji[offer.icon ?? ''] ?? '🎁'
                return (
                  <div key={offer.id} style={{ background: 'rgba(10,12,35,0.95)', border: `1px solid ${neon}40`, borderRadius: '3mm', padding: '3.5mm', display: 'flex', gap: '3mm', alignItems: 'flex-start' }}>
                    {offer.image_url ? (
                      <div style={{ width: '16mm', height: '16mm', borderRadius: '2mm', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={offer.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: '12mm', height: '12mm', borderRadius: '2mm', background: `${neon}15`, border: `1px solid ${neon}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5mm', flexShrink: 0 }}>
                        {emoji}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '3.5mm', fontWeight: 900, color: '#ffffff', marginBottom: '1mm' }}>{offer.title}</div>
                      {offer.description && <div style={{ fontSize: '2.8mm', color: '#64748b', marginBottom: '1mm', lineHeight: 1.3 }}>{offer.description}</div>}
                      {offer.reward && <div style={{ fontSize: '2.8mm', fontWeight: 900, color: neon, textShadow: `0 0 4mm ${neon}` }}>🎁 {offer.reward}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Roue des cadeaux */}
        <div style={{ textAlign: 'center', marginBottom: '5mm' }}>
          <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '3mm', padding: '2.5mm 6mm' }}>
            <div style={{ fontSize: '3mm', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.15em' }}>🎰 LA ROUE DES CADEAUX</div>
            <div style={{ fontSize: '2.8mm', color: '#64748b', marginTop: '1mm' }}>1 tour gratuit par jour — Canette, Chocolat, Zippo 40€...</div>
          </div>
        </div>

        {/* QR + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6mm', background: 'rgba(10,12,35,0.9)', border: '1px solid rgba(34,211,238,0.25)', borderRadius: '4mm', padding: '5mm' }}>
          {qrApiUrl && (
            <div style={{ background: '#ffffff', padding: '2.5mm', borderRadius: '2mm', flexShrink: 0 }}>
              <img src={qrApiUrl} alt="QR Code" style={{ width: '28mm', height: '28mm', display: 'block' }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: '5mm', fontWeight: 900, color: '#ffffff', marginBottom: '1.5mm', lineHeight: 1.1 }}>
              Scannez &amp;<br />
              <span style={{ color: '#22d3ee', textShadow: '0 0 6mm rgba(34,211,238,0.8)' }}>rejoignez-nous !</span>
            </div>
            <div style={{ fontSize: '2.8mm', color: '#64748b', marginBottom: '2mm' }}>Créez votre compte gratuit en 30 secondes</div>
            <div style={{ fontSize: '2.5mm', color: '#334155', fontFamily: 'monospace' }}>{appUrl}</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '4mm' }}>
          <div style={{ fontSize: '2.5mm', color: '#1e293b' }}>Ce programme de fidélité est réservé aux majeurs</div>
        </div>
      </div>
    </>
  )
}
