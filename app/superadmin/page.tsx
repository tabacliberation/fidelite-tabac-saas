'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Shop {
  id: string
  name: string
  slug: string
  admin_email: string
  subscription_status: string
  trial_ends_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

interface Invoice {
  id: string
  number: string | null
  amount: number
  status: string | null
  date: number
  pdf: string | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  trial:    { label: 'Essai',   color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  active:   { label: 'Actif',   color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  past_due: { label: 'Impayé',  color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  canceled: { label: 'Annulé', color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
}

export default function SuperAdminPage() {
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  useEffect(() => {
    fetchShops()
  }, [])

  async function fetchShops() {
    const res = await fetch('/api/superadmin/shops')
    if (res.status === 401) { router.push('/superadmin/login'); return }
    const data = await res.json()
    setShops(data.shops || [])
    setLoading(false)
  }

  async function fetchInvoices(shop: Shop) {
    setSelectedShop(shop)
    setInvoices([])
    if (!shop.stripe_customer_id) return
    setInvoicesLoading(true)
    const res = await fetch(`/api/superadmin/invoices?customerId=${shop.stripe_customer_id}`)
    const data = await res.json()
    setInvoices(data.invoices || [])
    setInvoicesLoading(false)
  }

  async function cancelSubscription(shop: Shop) {
    if (!shop.stripe_subscription_id) return
    if (!confirm(`Annuler l'abonnement de ${shop.name} ?`)) return
    setCancelingId(shop.id)
    await fetch('/api/superadmin/shops', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: shop.stripe_subscription_id }),
    })
    await fetchShops()
    setCancelingId(null)
  }

  async function logout() {
    await fetch('/api/superadmin/auth', { method: 'DELETE' })
    router.push('/superadmin/login')
  }

  const stats = {
    total: shops.length,
    active: shops.filter(s => s.subscription_status === 'active').length,
    trial: shops.filter(s => s.subscription_status === 'trial').length,
    canceled: shops.filter(s => ['canceled', 'past_due'].includes(s.subscription_status)).length,
  }

  return (
    <div className="min-h-screen neon-grid" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="border-b border-cyan-400/20 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold neon-cyan">Super Admin — TabacFrance</h1>
          <p className="text-slate-500 text-xs mt-0.5">Gestion des abonnements buralistes</p>
        </div>
        <button onClick={logout} className="text-slate-400 hover:text-red-400 text-sm transition-colors">
          Déconnexion
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'neon-cyan' },
            { label: 'Actifs', value: stats.active, color: 'text-green-400' },
            { label: 'Essai', value: stats.trial, color: 'text-yellow-400' },
            { label: 'Annulés', value: stats.canceled, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="neon-card rounded-xl p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="neon-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-cyan-400/20">
            <h2 className="font-semibold text-white">Tous les buralistes</h2>
          </div>
          {loading ? (
            <div className="p-10 text-center text-slate-400">Chargement...</div>
          ) : shops.length === 0 ? (
            <div className="p-10 text-center text-slate-400">Aucun buraliste inscrit</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase">
                    <th className="text-left px-6 py-3">Boutique</th>
                    <th className="text-left px-6 py-3">Email</th>
                    <th className="text-left px-6 py-3">Statut</th>
                    <th className="text-left px-6 py-3">Fin essai</th>
                    <th className="text-left px-6 py-3">Inscrit le</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map(shop => {
                    const st = STATUS_LABELS[shop.subscription_status] ?? { label: shop.subscription_status, color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' }
                    return (
                      <tr key={shop.id} className="border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{shop.name}</div>
                          <div className="text-slate-500 text-xs">/{shop.slug}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{shop.admin_email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {shop.trial_ends_at ? new Date(shop.trial_ends_at).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {shop.stripe_customer_id && (
                              <button
                                onClick={() => fetchInvoices(shop)}
                                className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-400/30 px-2 py-1 rounded-lg transition-colors"
                              >
                                Factures
                              </button>
                            )}
                            {shop.stripe_subscription_id && shop.subscription_status === 'active' && (
                              <button
                                onClick={() => cancelSubscription(shop)}
                                disabled={cancelingId === shop.id}
                                className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {cancelingId === shop.id ? '...' : 'Annuler'}
                              </button>
                            )}
                            <a
                              href={`https://tabacfrance.fr/${shop.slug}/admin`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-400 hover:text-slate-300 border border-slate-600 px-2 py-1 rounded-lg transition-colors"
                            >
                              Voir
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal factures */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="neon-card rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-cyan-400/20 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Factures — {selectedShop.name}</h3>
                <p className="text-slate-500 text-xs">{selectedShop.admin_email}</p>
              </div>
              <button onClick={() => setSelectedShop(null)} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="p-6">
              {!selectedShop.stripe_customer_id ? (
                <p className="text-slate-400 text-center py-4">Pas encore de client Stripe</p>
              ) : invoicesLoading ? (
                <p className="text-slate-400 text-center py-4">Chargement...</p>
              ) : invoices.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Aucune facture</p>
              ) : (
                <div className="space-y-3">
                  {invoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3">
                      <div>
                        <div className="text-white text-sm font-medium">{inv.number ?? inv.id}</div>
                        <div className="text-slate-400 text-xs">{new Date(inv.date * 1000).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${inv.status === 'paid' ? 'text-green-400' : 'text-red-400'}`}>
                          {inv.amount.toFixed(2)} €
                        </span>
                        {inv.pdf && (
                          <a href={inv.pdf} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-400/30 px-2 py-1 rounded-lg">
                            PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
