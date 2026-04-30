'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Search, Plus, Minus, Lock, Unlock, ChevronDown, ChevronUp, Users, Loader2, X, Bell, ImagePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  first_name: string
  last_name: string
  phone: string
  birth_date: string | null
  pin_locked: boolean
  created_at: string
}

interface CardRow {
  offer_id: string
  title: string
  required_points: number
  current_points: number
  completed_count: number
}

export default function AdminClientsPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [clients, setClients] = useState<Profile[]>([])
  const [filtered, setFiltered] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [cards, setCards] = useState<Record<string, CardRow[]>>({})
  const [cardsLoading, setCardsLoading] = useState<string | null>(null)

  // PIN modal (tampon)
  const [pending, setPending] = useState<{ profileId: string; offerId: string; action: 'add' | 'remove'; title: string } | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  // Notification par client
  const [pushClient, setPushClient] = useState<Profile | null>(null)
  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [pushImage, setPushImage] = useState('')
  const [pushUploading, setPushUploading] = useState(false)
  const [pushSending, setPushSending] = useState(false)
  const [pushResult, setPushResult] = useState<string | null>(null)

  useEffect(() => {
    if (!localStorage.getItem(`admin_${slug}`)) { router.push(`/${slug}/admin`); return }
    fetch(`/api/${slug}/admin/clients`).then(r => r.json()).then(data => {
      setClients(data.clients || [])
      setFiltered(data.clients || [])
      setLoading(false)
    })
  }, [slug, router])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(clients.filter(c =>
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.phone.includes(q)
    ))
  }, [search, clients])

  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!cards[id]) {
      setCardsLoading(id)
      const res = await fetch(`/api/${slug}/admin/client-cards?profileId=${id}`)
      const data = await res.json()
      setCards(prev => ({ ...prev, [id]: data.cards || [] }))
      setCardsLoading(null)
    }
  }

  const openPin = (profileId: string, offerId: string, action: 'add' | 'remove', title: string) => {
    setPending({ profileId, offerId, action, title })
    setPin('')
    setPinError('')
  }

  const submitPoint = async () => {
    if (!pending || !pin) { setPinError('PIN requis'); return }
    setPinLoading(true)
    setPinError('')
    const res = await fetch(`/api/${slug}/admin/add-point`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: pending.profileId, offerId: pending.offerId, action: pending.action, pin, count: 1 }),
    })
    const data = await res.json()
    setPinLoading(false)
    if (!res.ok) { setPinError(data.error || 'PIN incorrect'); return }

    const res2 = await fetch(`/api/${slug}/admin/client-cards?profileId=${pending.profileId}`)
    const data2 = await res2.json()
    setCards(prev => ({ ...prev, [pending.profileId]: data2.cards || [] }))
    setPending(null)
    setPin('')
  }

  const toggleLock = async (e: React.MouseEvent, profileId: string, lock: boolean) => {
    e.stopPropagation()
    await fetch(`/api/${slug}/admin/toggle-lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, lock }),
    })
    const upd = (list: Profile[]) => list.map(c => c.id === profileId ? { ...c, pin_locked: lock } : c)
    setClients(upd)
    setFiltered(upd)
  }

  const openPush = (e: React.MouseEvent, client: Profile) => {
    e.stopPropagation()
    setPushClient(client)
    setPushTitle('')
    setPushBody('')
    setPushImage('')
    setPushResult(null)
  }

  const handlePushImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPushUploading(true)
    const ext = file.name.split('.').pop()
    const path = `push/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('offer-images').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('offer-images').getPublicUrl(path)
      setPushImage(data.publicUrl)
    }
    setPushUploading(false)
  }

  const handleSendPush = async () => {
    if (!pushClient || !pushTitle || !pushBody) return
    setPushSending(true)
    setPushResult(null)
    const res = await fetch(`/api/${slug}/admin/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: pushTitle, body: pushBody, image: pushImage || null, profile_id: pushClient.id }),
    })
    const data = await res.json()
    setPushSending(false)
    if (res.ok) {
      setPushResult('✓ Notification envoyée !')
      setPushTitle('')
      setPushBody('')
      setPushImage('')
      setTimeout(() => { setPushClient(null); setPushResult(null) }, 1500)
    } else {
      setPushResult(`⚠️ ${data.error || 'Erreur'}`)
    }
  }

  const inputClass =
    'w-full rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none transition-all text-sm' +
    ' bg-[rgba(10,12,35,0.8)] border border-[rgba(34,211,238,0.2)] focus:border-[rgba(34,211,238,0.5)]'

  return (
    <div className="min-h-screen pb-8" style={{ background: '#06061a' }}>
      {/* Header */}
      <div className="px-5 pb-4 page-top-pad" style={{ background: 'rgba(10,12,35,0.95)', borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} style={{ color: '#475569' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Users className="w-5 h-5" style={{ color: '#d946ef' }} />
            <h1 className="text-xl font-black text-white">
              Clients <span className="text-sm font-normal" style={{ color: '#475569' }}>({clients.length})</span>
            </h1>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
          <input
            type="text" placeholder="Rechercher par nom ou téléphone..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-slate-500 focus:outline-none"
            style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)' }}
          />
        </div>
      </div>

      <div className="px-5 pt-4 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(34,211,238,0.05)' }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20" style={{ color: '#475569' }}>
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Aucun client trouvé</p>
          </div>
        ) : (
          filtered.map(client => (
            <div key={client.id} className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(10,12,35,0.85)', border: `1px solid ${client.pin_locked ? 'rgba(248,113,113,0.3)' : 'rgba(217,70,239,0.2)'}` }}
            >
              {/* Ligne client */}
              <div
                onClick={() => toggleExpand(client.id)}
                className="flex items-center justify-between px-4 py-4 cursor-pointer select-none"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {client.first_name} {client.last_name}
                    </span>
                    {client.pin_locked && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse"
                        style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
                      >
                        BLOQUÉ
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{client.phone}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Notification */}
                  <button
                    onClick={e => openPush(e, client)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}
                    title="Envoyer une notification"
                  >
                    <Bell className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />
                  </button>
                  {/* Lock/Unlock */}
                  <button
                    onClick={e => toggleLock(e, client.id, !client.pin_locked)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    title={client.pin_locked ? 'Débloquer' : 'Bloquer'}
                  >
                    {client.pin_locked
                      ? <Unlock className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
                      : <Lock className="w-3.5 h-3.5" style={{ color: '#475569' }} />}
                  </button>
                  {expanded === client.id
                    ? <ChevronUp className="w-4 h-4" style={{ color: '#475569' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: '#475569' }} />}
                </div>
              </div>

              {/* Détail cartes */}
              {expanded === client.id && (
                <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid rgba(34,211,238,0.1)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest pt-3 mb-3" style={{ color: '#22d3ee' }}>
                    Cartes fidélité
                  </p>
                  {cardsLoading === client.id ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#22d3ee' }} />
                    </div>
                  ) : !cards[client.id] || cards[client.id].length === 0 ? (
                    <p className="text-sm py-2" style={{ color: '#475569' }}>Aucune offre active</p>
                  ) : (
                    cards[client.id].map(card => (
                      <div key={card.offer_id} className="flex items-center justify-between rounded-xl px-3 py-3"
                        style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.12)' }}
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm font-bold text-white truncate">{card.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(34,211,238,0.1)' }}>
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, (card.current_points / card.required_points) * 100)}%`, background: '#22d3ee', boxShadow: '0 0 6px #22d3ee' }}
                              />
                            </div>
                            <span className="text-xs font-bold shrink-0" style={{ color: '#22d3ee' }}>
                              {card.current_points}/{card.required_points}
                            </span>
                          </div>
                          {card.completed_count > 0 && (
                            <p className="text-xs mt-0.5" style={{ color: '#4ade80' }}>
                              {card.completed_count} récompense{card.completed_count > 1 ? 's' : ''} obtenue{card.completed_count > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => openPin(client.id, card.offer_id, 'remove', card.title)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}
                          >
                            <Minus className="w-4 h-4" style={{ color: '#f87171' }} />
                          </button>
                          <button
                            onClick={() => openPin(client.id, card.offer_id, 'add', card.title)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                            style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}
                          >
                            <Plus className="w-4 h-4" style={{ color: '#22d3ee' }} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal PIN tampon */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <div className="w-full max-w-xs rounded-3xl p-6"
            style={{ background: 'rgba(6,6,26,0.98)', border: '1px solid rgba(34,211,238,0.3)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#22d3ee' }}>Code PIN</p>
              <button onClick={() => setPending(null)} style={{ color: '#475569' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white font-bold text-sm mb-1">
              {pending.action === 'add' ? '+ Tampon' : '− Tampon'}
            </p>
            <p className="text-xs mb-5 truncate" style={{ color: '#64748b' }}>{pending.title}</p>

            <input
              type="password" inputMode="numeric" maxLength={8}
              placeholder="••••"
              value={pin} onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitPoint()}
              className="w-full rounded-xl px-4 py-4 text-center text-2xl tracking-widest font-black mb-3 focus:outline-none"
              style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)', color: '#22d3ee' }}
              autoFocus
            />
            {pinError && <p className="text-red-400 text-sm mb-3 text-center">{pinError}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setPending(null); setPin(''); setPinError('') }}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
              >Annuler</button>
              <button onClick={submitPoint} disabled={pinLoading}
                className="flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)' }}
              >
                {pinLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal notification client */}
      {pushClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <div className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: 'rgba(6,6,26,0.98)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: '#8b5cf6' }}>Notification</p>
                <p className="text-white font-bold text-sm">{pushClient.first_name} {pushClient.last_name}</p>
              </div>
              <button onClick={() => setPushClient(null)} style={{ color: '#475569' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                placeholder="Titre (ex: Promo du jour !)"
                value={pushTitle}
                onChange={e => setPushTitle(e.target.value)}
                className={inputClass}
              />
              <textarea
                placeholder="Message..."
                rows={3}
                value={pushBody}
                onChange={e => setPushBody(e.target.value)}
                className={inputClass + ' resize-none'}
              />

              {/* Image */}
              {pushImage ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={pushImage} alt="preview" className="w-full h-32 object-cover" />
                  <button onClick={() => setPushImage('')}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.7)' }}
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full rounded-xl py-3 cursor-pointer transition-all"
                  style={{ background: 'rgba(10,12,35,0.8)', border: '1px dashed rgba(139,92,246,0.3)', color: '#475569' }}
                >
                  {pushUploading
                    ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <><ImagePlus className="w-4 h-4" /> <span className="text-xs">Photo (optionnel)</span></>
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={handlePushImageUpload} />
                </label>
              )}

              {pushResult && (
                <p className="text-sm rounded-xl px-4 py-3 text-center font-bold"
                  style={pushResult.startsWith('✓')
                    ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }
                    : { color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }
                  }
                >
                  {pushResult}
                </p>
              )}

              <button onClick={handleSendPush} disabled={pushSending || !pushTitle || !pushBody}
                className="w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 16px rgba(139,92,246,0.15)' }}
              >
                {pushSending
                  ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <><Bell className="w-4 h-4" /> Envoyer la notification</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
