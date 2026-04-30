'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, EyeOff, Clock, ImagePlus, X } from 'lucide-react'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const DEFAULT_HOURS: Record<string, string> = {
  'Lundi': '06:00 – 19:30',
  'Mardi': '06:00 – 19:30',
  'Mercredi': '06:00 – 19:30',
  'Jeudi': '06:00 – 19:30',
  'Vendredi': '06:00 – 19:30',
  'Samedi': '07:30 – 19:30',
  'Dimanche': 'Fermé',
}

type DayHours = { open: boolean; start: string; end: string }

function parseHours(raw: Record<string, string>): Record<string, DayHours> {
  const result: Record<string, DayHours> = {}
  for (const day of DAYS) {
    const val = raw[day] ?? DEFAULT_HOURS[day]
    if (val === 'Fermé' || !val.includes('–')) {
      result[day] = { open: false, start: '06:00', end: '19:30' }
    } else {
      const parts = val.split('–').map(s => s.trim())
      result[day] = { open: true, start: parts[0] || '06:00', end: parts[1] || '19:30' }
    }
  }
  return result
}

function serializeHours(hours: Record<string, DayHours>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const day of DAYS) {
    const d = hours[day]
    result[day] = d.open ? `${d.start} – ${d.end}` : 'Fermé'
  }
  return result
}

export default function AdminSettingsPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [form, setForm] = useState({ shopName: '', pinCode: '', address: '', phone: '' })
  const [hours, setHours] = useState<Record<string, DayHours>>(() => parseHours(DEFAULT_HOURS))
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const inputClass = 'w-full rounded-xl py-4 px-4 text-white focus:outline-none transition-all' +
    ' bg-[rgba(10,12,35,0.8)] border border-[rgba(34,211,238,0.2)] focus:border-[rgba(34,211,238,0.6)]'

  useEffect(() => {
    if (!localStorage.getItem(`admin_${slug}`)) { router.push(`/${slug}/admin`); return }
    fetch(`/api/${slug}/admin/settings`).then(r => r.json()).then(data => {
      setForm({
        shopName: data.shopName || '',
        pinCode: data.pinCode || '1234',
        address: data.address || '',
        phone: data.phone || '',
      })
      setHours(parseHours(data.hours || DEFAULT_HOURS))
      setHeroImage(data.heroImage || null)
      setLoading(false)
    })
  }, [slug, router])

  const setDayHours = (day: string, patch: Partial<DayHours>) => {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], ...patch } }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`/api/${slug}/admin/upload`, { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur upload'); setUploading(false); return }
    setHeroImage(data.url)
    setUploading(false)
  }

  const removeHeroImage = async () => {
    setHeroImage(null)
    await fetch(`/api/${slug}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, hours: serializeHours(hours), heroImage: null }),
    })
  }

  const handleSave = async () => {
    if (!form.pinCode || form.pinCode.length < 4) { setError('PIN minimum 4 chiffres'); return }
    setSaving(true)
    setError('')
    const res = await fetch(`/api/${slug}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, hours: serializeHours(hours), heroImage }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur'); setSaving(false); return }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen neon-grid px-5 page-top-pad pb-8" style={{ background: '#06061a' }}>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} style={{ color: '#475569' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-white">Paramètres</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(34,211,238,0.06)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs mb-2 block" style={{ color: '#22d3ee' }}>Nom du commerce</label>
            <input value={form.shopName} onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs mb-2 block" style={{ color: '#22d3ee' }}>Adresse</label>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs mb-2 block" style={{ color: '#22d3ee' }}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs mb-2 block" style={{ color: '#22d3ee' }}>Code PIN (pour ajouter des tampons)</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={form.pinCode}
                onChange={e => setForm(f => ({ ...f, pinCode: e.target.value }))}
                className={inputClass + ' pr-12 tracking-widest text-lg'}
              />
              <button onClick={() => setShowPin(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#475569' }}>
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: '#475569' }}>4 à 6 chiffres recommandés</p>
          </div>

          {/* Photo d'accueil */}
          <div>
            <label className="text-xs mb-2 block" style={{ color: '#22d3ee' }}>Photo d&apos;accueil</label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {heroImage ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ height: 160 }}>
                <img src={heroImage} alt="hero" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,6,26,0.6) 0%, transparent 60%)' }} />
                <button
                  onClick={removeHeroImage}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.8)', border: '1px solid rgba(239,68,68,0.5)' }}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 text-xs px-3 py-1.5 rounded-xl font-bold"
                  style={{ background: 'rgba(34,211,238,0.2)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)' }}
                >
                  Changer
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-xl py-8 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ background: 'rgba(10,12,35,0.8)', border: '2px dashed rgba(34,211,238,0.25)' }}
              >
                <ImagePlus className="w-8 h-8" style={{ color: 'rgba(34,211,238,0.5)' }} />
                <span className="text-sm font-semibold" style={{ color: 'rgba(34,211,238,0.7)' }}>
                  {uploading ? 'Envoi en cours...' : 'Choisir une photo'}
                </span>
                <span className="text-xs" style={{ color: '#475569' }}>JPG, PNG — s&apos;affiche en fond sur la page d&apos;accueil</span>
              </button>
            )}
          </div>

          {/* Horaires */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.15)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" style={{ color: '#22d3ee' }} />
              <span className="text-sm font-bold" style={{ color: '#22d3ee' }}>Horaires d&apos;ouverture</span>
            </div>
            <div className="space-y-3">
              {DAYS.map(day => {
                const d = hours[day]
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-xs font-semibold w-16 shrink-0" style={{ color: '#94a3b8' }}>{day}</span>
                    <button
                      onClick={() => setDayHours(day, { open: !d.open })}
                      className="text-xs px-2 py-1 rounded-lg font-bold shrink-0 transition-all"
                      style={d.open
                        ? { background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.35)' }
                        : { background: 'rgba(71,85,105,0.2)', color: '#475569', border: '1px solid rgba(71,85,105,0.3)' }
                      }
                    >
                      {d.open ? 'Ouvert' : 'Fermé'}
                    </button>
                    {d.open ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                          type="time"
                          value={d.start}
                          onChange={e => setDayHours(day, { start: e.target.value })}
                          className="flex-1 min-w-0 rounded-lg py-1.5 px-2 text-sm text-white focus:outline-none"
                          style={{ background: 'rgba(10,12,35,0.8)', border: '1px solid rgba(34,211,238,0.2)', colorScheme: 'dark' }}
                        />
                        <span className="text-xs shrink-0" style={{ color: '#475569' }}>–</span>
                        <input
                          type="time"
                          value={d.end}
                          onChange={e => setDayHours(day, { end: e.target.value })}
                          className="flex-1 min-w-0 rounded-lg py-1.5 px-2 text-sm text-white focus:outline-none"
                          style={{ background: 'rgba(10,12,35,0.8)', border: '1px solid rgba(34,211,238,0.2)', colorScheme: 'dark' }}
                        />
                      </div>
                    ) : (
                      <span className="text-xs flex-1" style={{ color: '#475569' }}>Fermé ce jour</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="text-sm rounded-xl px-4 py-3" style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </p>
          )}
          {saved && (
            <p className="text-sm rounded-xl px-4 py-3" style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}>
              ✓ Paramètres enregistrés
            </p>
          )}

          <button onClick={handleSave} disabled={saving}
            className="w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-2 transition-all"
            style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 16px rgba(34,211,238,0.2)' }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>

          <div className="rounded-2xl p-4 mt-2" style={{ background: 'rgba(34,211,238,0.03)', border: '1px solid rgba(34,211,238,0.12)' }}>
            <p className="text-xs mb-1" style={{ color: '#475569' }}>Lien de votre application</p>
            <code className="text-sm break-all" style={{ color: '#22d3ee' }}>
              {typeof window !== 'undefined' ? window.location.origin : ''}/{slug}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}
