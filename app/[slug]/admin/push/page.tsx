'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, X, ImagePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminPushPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [form, setForm] = useState({ title: '', body: '', image: '' })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem(`admin_${slug}`)) router.push(`/${slug}/admin`)
  }, [slug, router])

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
    const res = await fetch(`/api/${slug}/admin/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur envoi'); setLoading(false); return }
    setResult(data.sent ?? 0)
    setLoading(false)
  }

  const inputClass =
    'w-full rounded-xl py-4 px-4 text-white placeholder-slate-500 focus:outline-none transition-all' +
    ' bg-[rgba(10,12,35,0.8)] border border-[rgba(34,211,238,0.2)] focus:border-[rgba(34,211,238,0.6)]'

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
                style={{ background: 'rgba(0,0,0,0.7)' }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 w-full rounded-xl py-4 cursor-pointer transition-all"
              style={{ background: 'rgba(10,12,35,0.8)', border: '1px dashed rgba(34,211,238,0.3)', color: '#475569' }}
            >
              {uploading
                ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <><ImagePlus className="w-5 h-5" /> <span className="text-sm">Ajouter une photo</span></>
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>

        {error && (
          <p className="text-sm rounded-xl px-4 py-3"
            style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
            {error}
          </p>
        )}

        {result !== null && (
          <p className="text-sm rounded-xl px-4 py-3"
            style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}>
            ✓ Notification envoyée à {result} client{result > 1 ? 's' : ''}
          </p>
        )}

        <button onClick={handleSend} disabled={loading || !form.title || !form.body}
          className="w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 16px rgba(34,211,238,0.2)' }}
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <><Send className="w-4 h-4" /> Envoyer à tous les clients</>
          }
        </button>
      </div>
    </div>
  )
}
