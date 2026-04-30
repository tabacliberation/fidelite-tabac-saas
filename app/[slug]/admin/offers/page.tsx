'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Plus, ArrowLeft, Trash2, ToggleLeft, ToggleRight, Edit3, Upload, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'

const ICONS = ['coffee', 'package', 'smartphone', 'gift', 'star', 'zap']

const EMPTY_STAMP = { title: '', description: '', required_points: 10, reward: '', icon: 'gift', image_url: '' }
const EMPTY_SIMPLE = { title: '', description: '', reward: '', icon: 'gift', image_url: '' }

export default function AdminOffersPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'stamp' | 'simple'>('stamp')

  const [offers, setOffers] = useState<any[]>([])
  const [simpleOffers, setSimpleOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [simpleLoading, setSimpleLoading] = useState(true)

  const [editOffer, setEditOffer] = useState<any | null>(null)
  const [editSimple, setEditSimple] = useState<any | null>(null)
  const [stampForm, setStampForm] = useState(EMPTY_STAMP)
  const [simpleForm, setSimpleForm] = useState(EMPTY_SIMPLE)

  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem(`admin_${slug}`)) { router.push(`/${slug}/admin`); return }
    fetchOffers()
    fetchSimpleOffers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const fetchOffers = () => {
    fetch(`/api/${slug}/admin/offers`).then(r => r.json()).then(d => {
      setOffers(d.offers || [])
      setLoading(false)
    })
  }

  const fetchSimpleOffers = () => {
    fetch(`/api/${slug}/admin/simple-offers`).then(r => r.json()).then(d => {
      setSimpleOffers(d.offers || [])
      setSimpleLoading(false)
    })
  }

  const openCreate = () => {
    if (mode === 'stamp') { setEditOffer(null); setStampForm(EMPTY_STAMP) }
    else { setEditSimple(null); setSimpleForm(EMPTY_SIMPLE) }
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (offer: any) => {
    if (mode === 'stamp') {
      setEditOffer(offer)
      setStampForm({ title: offer.title, description: offer.description ?? '', required_points: offer.required_points, reward: offer.reward ?? '', icon: offer.icon ?? 'gift', image_url: offer.image_url ?? '' })
    } else {
      setEditSimple(offer)
      setSimpleForm({ title: offer.title, description: offer.description ?? '', reward: offer.reward ?? '', icon: offer.icon ?? 'gift', image_url: offer.image_url ?? '' })
    }
    setSaveError('')
    setShowForm(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `offer-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('offer-images').upload(fileName, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('offer-images').getPublicUrl(data.path)
      if (mode === 'stamp') setStampForm(f => ({ ...f, image_url: urlData.publicUrl }))
      else setSimpleForm(f => ({ ...f, image_url: urlData.publicUrl }))
    }
    setUploading(false)
  }

  const handleSave = async () => {
    const form = mode === 'stamp' ? stampForm : simpleForm
    if (!form.title) { setSaveError('Titre requis'); return }
    setSaving(true)
    setSaveError('')

    let url: string
    let method: string
    let body: object

    if (mode === 'stamp') {
      url = editOffer ? `/api/${slug}/admin/offers/${editOffer.id}` : `/api/${slug}/admin/offers`
      method = editOffer ? 'PUT' : 'POST'
      body = { title: stampForm.title, description: stampForm.description, required_points: stampForm.required_points, reward: stampForm.reward, icon: stampForm.icon, image_url: stampForm.image_url || null }
    } else {
      url = editSimple ? `/api/${slug}/admin/simple-offers/${editSimple.id}` : `/api/${slug}/admin/simple-offers`
      method = editSimple ? 'PUT' : 'POST'
      body = { title: simpleForm.title, description: simpleForm.description, reward: simpleForm.reward, icon: simpleForm.icon, image_url: simpleForm.image_url || null }
    }

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setSaveError(data.error || 'Erreur'); return }
    setShowForm(false)
    mode === 'stamp' ? fetchOffers() : fetchSimpleOffers()
  }

  const toggleActive = async (offer: any) => {
    const base = mode === 'stamp' ? `/api/${slug}/admin/offers` : `/api/${slug}/admin/simple-offers`
    await fetch(`${base}/${offer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !offer.is_active }),
    })
    mode === 'stamp' ? fetchOffers() : fetchSimpleOffers()
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Supprimer cette offre ?')) return
    const base = mode === 'stamp' ? `/api/${slug}/admin/offers` : `/api/${slug}/admin/simple-offers`
    await fetch(`${base}/${id}`, { method: 'DELETE' })
    mode === 'stamp' ? fetchOffers() : fetchSimpleOffers()
  }

  const inputClass =
    'w-full rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none transition-all' +
    ' bg-[rgba(10,12,35,0.9)] border border-[rgba(34,211,238,0.2)] focus:border-[rgba(34,211,238,0.6)]'

  const form = mode === 'stamp' ? stampForm : simpleForm
  const currentList = mode === 'stamp' ? offers : simpleOffers
  const isLoading = mode === 'stamp' ? loading : simpleLoading

  return (
    <div className="min-h-screen pb-8" style={{ background: '#06061a' }}>
      {/* Header */}
      <div className="px-5 pb-4 page-top-pad" style={{ background: 'rgba(10,12,35,0.95)', borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} style={{ color: '#475569' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black text-white flex-1">Gestion des Offres</h1>
          <button onClick={openCreate}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.4)' }}
          >
            <Plus className="w-5 h-5" style={{ color: '#22d3ee' }} />
          </button>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(34,211,238,0.2)' }}>
          <button onClick={() => setMode('stamp')} className="flex-1 py-2.5 text-sm font-bold transition-all"
            style={mode === 'stamp' ? { background: 'rgba(34,211,238,0.15)', color: '#22d3ee' } : { color: '#475569' }}
          >Avec tampons</button>
          <button onClick={() => setMode('simple')} className="flex-1 py-2.5 text-sm font-bold transition-all"
            style={mode === 'simple' ? { background: 'rgba(217,70,239,0.15)', color: '#d946ef' } : { color: '#475569' }}
          >Hors tampon</button>
        </div>
      </div>

      {/* List */}
      <div className="px-5 pt-5 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(34,211,238,0.05)' }} />
          ))
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center py-20" style={{ color: '#475569' }}>
            <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Aucune offre. Appuyez sur + pour créer.</p>
          </div>
        ) : (
          currentList.map(offer => (
            <div key={offer.id} className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(10,12,35,0.85)', border: `1px solid ${offer.is_active ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.06)'}`, opacity: offer.is_active ? 1 : 0.5 }}
            >
              <div className="flex items-center gap-3 p-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                  style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)' }}
                >
                  {offer.image_url
                    ? <Image src={offer.image_url} alt={offer.title} width={56} height={56} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5" style={{ color: '#334155' }} /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{offer.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                    {mode === 'stamp' ? `${offer.required_points} tampons → ${offer.reward}` : offer.reward || offer.description || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(offer)} className="w-8 h-8 flex items-center justify-center" style={{ color: '#475569' }}>
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleActive(offer)} className="w-8 h-8 flex items-center justify-center">
                    {offer.is_active
                      ? <ToggleRight className="w-5 h-5" style={{ color: '#4ade80' }} />
                      : <ToggleLeft className="w-5 h-5" style={{ color: '#334155' }} />}
                  </button>
                  <button onClick={() => deleteItem(offer.id)} className="w-8 h-8 flex items-center justify-center" style={{ color: '#f87171' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl"
            style={{ background: 'rgba(6,6,26,0.98)', borderTop: '1px solid rgba(34,211,238,0.3)' }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(34,211,238,0.1)' }}>
              <h2 className="text-lg font-black" style={{ color: '#22d3ee', textShadow: '0 0 8px #22d3ee' }}>
                {(mode === 'stamp' ? editOffer : editSimple) ? "Modifier l'offre" : 'Nouvelle offre'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ color: '#475569' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Image upload */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: '#22d3ee' }}>Photo</label>
                <div onClick={() => fileRef.current?.click()}
                  className="relative w-full h-44 rounded-2xl overflow-hidden cursor-pointer"
                  style={form.image_url
                    ? { border: '1px solid rgba(34,211,238,0.3)' }
                    : { border: '2px dashed rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.03)' }}
                >
                  {form.image_url ? (
                    <Image src={form.image_url} alt="preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      {uploading
                        ? <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }} />
                        : <><Upload className="w-6 h-6" style={{ color: '#22d3ee' }} /><p className="text-sm text-white">Ajouter une photo</p></>
                      }
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {form.image_url && (
                  <button
                    onClick={() => mode === 'stamp' ? setStampForm(f => ({ ...f, image_url: '' })) : setSimpleForm(f => ({ ...f, image_url: '' }))}
                    className="mt-2 text-xs flex items-center gap-1" style={{ color: '#f87171' }}
                  >
                    <X className="w-3 h-3" /> Supprimer la photo
                  </button>
                )}
              </div>

              {/* Common fields */}
              {[
                { key: 'title', label: 'Titre', placeholder: 'ex: Café Offert' },
                { key: 'description', label: 'Description', placeholder: 'ex: Pour tout achat de 5 cafés' },
                { key: 'reward', label: 'Récompense', placeholder: 'ex: 1 Café Gratuit' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: '#22d3ee' }}>{label}</label>
                  <input
                    value={(form as any)[key] ?? ''}
                    onChange={e => mode === 'stamp'
                      ? setStampForm(f => ({ ...f, [key]: e.target.value }))
                      : setSimpleForm(f => ({ ...f, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className={inputClass}
                  />
                </div>
              ))}

              <div className={mode === 'stamp' ? 'flex gap-3' : ''}>
                {mode === 'stamp' && (
                  <div className="flex-1">
                    <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: '#22d3ee' }}>Tampons requis</label>
                    <input type="number" min={1} value={stampForm.required_points}
                      onChange={e => setStampForm(f => ({ ...f, required_points: Number(e.target.value) }))}
                      className={inputClass}
                    />
                  </div>
                )}
                <div className={mode === 'stamp' ? 'flex-1' : ''}>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: '#22d3ee' }}>Icône</label>
                  <select
                    value={form.icon}
                    onChange={e => mode === 'stamp'
                      ? setStampForm(f => ({ ...f, icon: e.target.value }))
                      : setSimpleForm(f => ({ ...f, icon: e.target.value }))
                    }
                    className={inputClass}
                  >
                    {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              {saveError && (
                <p className="text-sm rounded-xl px-4 py-3"
                  style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  {saveError}
                </p>
              )}

              <div className="flex gap-3 pt-2 pb-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-4 rounded-2xl text-sm font-bold"
                  style={{ border: '1px solid rgba(34,211,238,0.2)', color: '#64748b' }}
                >Annuler</button>
                <button onClick={handleSave} disabled={saving || !form.title}
                  className="flex-1 py-4 rounded-2xl text-sm font-black disabled:opacity-50 transition-all"
                  style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)' }}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
