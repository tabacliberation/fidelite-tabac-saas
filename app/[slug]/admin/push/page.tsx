'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, X, ImagePlus, Clock, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminPushPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [form, setForm] = useState({ title: '', body: '', image: '' })
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ sent?: number; pushed?: number; subs?: number; pushErrors?: string[]; scheduled?: boolean } | null>(null)
  const [error, setError] = useState('')
  const [scheduled, setScheduled] = useState<any[]>([])

  useEffect(() => {
    if (!localStorage.getItem(`admin_${slug}`)) router.push(`/${slug}/admin`)
    fetchScheduled()
  }, [slug, router])

  const fetchScheduled = async () => {
    const res = await fetch(`/api/${slug}/admin/scheduled-push`).catch(() => null)
    if (res?.ok) {
      const d = await res.json()
      setScheduled(d.items ?? [])
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `push/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('offer-images').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('offer-images').getPublicUrl(path)
      setForm(f => ({ ...f, image: data.publicUrl }))
    }
    setUploading(false)
  }

  const handleSend = async () => {
    setLoading(true)
    setResult(null)
    setError('')

    if (scheduledAt) {
      // Programmée
      const res = await fetch(`/api/${slug}/admin/scheduled-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, scheduled_at: new Date(scheduledAt).toISOString() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); setLoading(false); return }
      setResult({ scheduled: true })
      setScheduledAt('')
      setForm({ title: '', body: '', image: '' })
      fetchScheduled()
    } else {
      // Immédiate
      const res = await fetch(`/api/${slug}/admin/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur envoi'); setLoading(false); return }
      setResult(data)
    }
    setLoading(false)
  }

  const handleDeleteScheduled = async (id: string) => {
    await fetch(`/api/${slug}/admin/scheduled-push?id=${id}`, { method: 'DELETE' })
    fetchScheduled()
  }

  const inputClass =
    'w-full rounded-xl py-4 px-4 text-white placeholder-slate-500 focus:outline-none transition-all' +
    ' bg-[rgba(10,12,35,0.8)] border border-[rgba(34,211,238,0.2)] focus:border-[rgba(34,211,238,0.6)]'

  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16)

  return (
    <div className="min-h-screen neon-grid px-5 page-top-pad pb-8" style={{ background: '#06061a' }}>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} style={{ color: '#475569' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-white">Envoyer une notification</h1>
      </div>

      <div className="space-y-4">
        <input
          placeholder="Titre (ex: Promo du jour !)"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className={inputClass}
        />
        <textarea
          placeholder="Message..."
          rows={4}
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          className={inputClass + ' resize-none'}
        />

        <div>
          <p className="text-xs font-bold mb-2" style={{ color: '#64748b' }}>Photo (optionnel)</p>
          {form.image ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={form.image} alt="preview" className="w-full h-40 object-cover" />
              <button onClick={() => setForm(f => ({ ...f, image: '' }))}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.7)' }}>
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 w-full rounded-xl py-4 cursor-pointer"
              style={{ background: 'rgba(10,12,35,0.8)', border: '1px dashed rgba(34,211,238,0.3)', color: '#475569' }}>
              {uploading
                ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <><ImagePlus className="w-5 h-5" /> <span className="text-sm">Ajouter une photo</span></>}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>

        {/* Programmer l'envoi */}
        <div className="rounded-xl p-4 space-y-2"
          style={{ background: 'rgba(10,12,35,0.8)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            <p className="text-xs font-bold" style={{ color: '#8b5cf6' }}>Programmer l&apos;envoi (optionnel)</p>
          </div>
          <input
            type="datetime-local"
            value={scheduledAt}
            min={minDateTime}
            onChange={e => setScheduledAt(e.target.value)}
            className="w-full rounded-xl py-3 px-4 text-white focus:outline-none"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.3)', colorScheme: 'dark' }}
          />
          {scheduledAt && (
            <button onClick={() => setScheduledAt('')} className="text-xs" style={{ color: '#475569' }}>
              × Annuler la programmation
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm rounded-xl px-4 py-3"
            style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
            {error}
          </p>
        )}

        {result !== null && (
          <div className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}>
            {result.scheduled ? (
              <p className="text-sm font-bold" style={{ color: '#4ade80' }}>✓ Notification programmée !</p>
            ) : (
              <p className="text-sm font-bold" style={{ color: '#4ade80' }}>
                ✓ Envoyé à {result.pushed}/{result.subs} appareil{(result.subs ?? 0) > 1 ? 's' : ''} ({result.sent} client{(result.sent ?? 0) > 1 ? 's' : ''})
              </p>
            )}
          </div>
        )}

        <button onClick={handleSend} disabled={loading || !form.title || !form.body}
          className="w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          style={{ background: scheduledAt ? 'rgba(139,92,246,0.15)' : 'rgba(34,211,238,0.15)', color: scheduledAt ? '#8b5cf6' : '#22d3ee', border: `1px solid ${scheduledAt ? 'rgba(139,92,246,0.4)' : 'rgba(34,211,238,0.4)'}` }}
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : scheduledAt
              ? <><Calendar className="w-4 h-4" /> Programmer la notification</>
              : <><Send className="w-4 h-4" /> Envoyer maintenant</>
          }
        </button>

        {/* Notifications programmées */}
        {scheduled.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>Programmées</p>
            {scheduled.map((s) => (
              <div key={s.id} className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Clock className="w-4 h-4 shrink-0" style={{ color: '#8b5cf6' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{s.title}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    {new Date(s.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => handleDeleteScheduled(s.id)} style={{ color: '#475569' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
