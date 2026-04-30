'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, TrendingUp, CreditCard, AlertTriangle,
  Search, ExternalLink, FileText, X, LogOut,
  ChevronRight, Cigarette, BarChart3, Settings
} from 'lucide-react'

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

const STATUS: Record<string, { label: string; dot: string; badge: string }> = {
  trial:    { label: 'Essai',   dot: 'bg-yellow-400', badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  active:   { label: 'Actif',   dot: 'bg-green-400',  badge: 'text-green-400 bg-green-400/10 border-green-400/30'   },
  past_due: { label: 'Impayé',  dot: 'bg-red-400',    badge: 'text-red-400 bg-red-400/10 border-red-400/30'         },
  canceled: { label: 'Annulé', dot: 'bg-slate-400',  badge: 'text-slate-400 bg-slate-400/10 border-slate-400/30'   },
}

const TABS = [
  { id: 'overview',  label: 'Vue d\'ensemble', icon: BarChart3 },
  { id: 'shops',     label: 'Buralistes',       icon: Users     },
  { id: 'revenue',   label: 'Revenus',           icon: TrendingUp },
]

const FLEX_PRICE = 19.90
const ENGAGEMENT_PRICE = 14.90

export default function SuperAdminPage() {
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  useEffect(() => { fetchShops() }, [])

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

  const stats = useMemo(() => ({
    total:    shops.length,
    active:   shops.filter(s => s.subscription_status === 'active').length,
    trial:    shops.filter(s => s.subscription_status === 'trial').length,
    past_due: shops.filter(s => s.subscription_status === 'past_due').length,
    canceled: shops.filter(s => s.subscription_status === 'canceled').length,
    mrr:      shops.filter(s => s.subscription_status === 'active').length * FLEX_PRICE,
  }), [shops])

  const filtered = useMemo(() => shops.filter(s => {
    const matchSearch = search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admin_email.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.subscription_status === filterStatus
    return matchSearch && matchStatus
  }), [shops, search, filterStatus])

  const trialEndingSoon = shops.filter(s => {
    if (s.subscription_status !== 'trial' || !s.trial_ends_at) return false
    const days = (new Date(s.trial_ends_at).getTime() - Date.now()) / 86400000
    return days <= 3 && days >= 0
  })

  return (
    <div className="min-h-screen neon-grid" style={{ background: 'var(--bg)' }}>

      {/* Sidebar */}
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-cyan-400/15 flex flex-col shrink-0 hidden md:flex">
          {/* Logo */}
          <div className="p-6 border-b border-cyan-400/15">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 12px rgba(34,211,238,0.2)' }}>
                <Cigarette className="w-4 h-4" style={{ color: '#22d3ee' }} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">TabacFrance</p>
                <p className="text-slate-500 text-xs">Super Admin</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === id
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Alerts */}
          {trialEndingSoon.length > 0 && (
            <div className="m-4 p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/25">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold">Essais expirant bientôt</span>
              </div>
              {trialEndingSoon.map(s => (
                <p key={s.id} className="text-xs text-slate-300 truncate">{s.name}</p>
              ))}
            </div>
          )}

          {/* Logout */}
          <div className="p-4 border-t border-cyan-400/15">
            <button onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 text-sm transition-all">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Topbar mobile */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-cyan-400/15">
            <span className="text-white font-bold text-sm">Super Admin</span>
            <div className="flex gap-1">
              {TABS.map(({ id, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`p-2 rounded-lg ${tab === id ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 max-w-5xl">

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Vue d'ensemble</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Résumé global de la plateforme</p>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total inscrits', value: stats.total, icon: Users,       color: '#22d3ee' },
                    { label: 'Abonnés actifs', value: stats.active, icon: CreditCard,  color: '#4ade80' },
                    { label: 'En essai',        value: stats.trial,  icon: AlertTriangle, color: '#facc15' },
                    { label: 'MRR estimé',      value: `${stats.mrr.toFixed(0)} €`, icon: TrendingUp, color: '#d946ef' },
                  ].map(k => (
                    <div key={k.label} className="neon-card rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: `${k.color}18`, border: `1px solid ${k.color}40` }}>
                          <k.icon className="w-4 h-4" style={{ color: k.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-white">{k.value}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{k.label}</div>
                    </div>
                  ))}
                </div>

                {/* Statuts */}
                <div className="neon-card rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-4">Répartition par statut</h3>
                  <div className="space-y-3">
                    {(['active', 'trial', 'past_due', 'canceled'] as const).map(s => {
                      const count = shops.filter(sh => sh.subscription_status === s).length
                      const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
                      const st = STATUS[s]
                      return (
                        <div key={s}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${st.dot}`} />
                              <span className="text-sm text-slate-300">{st.label}</span>
                            </div>
                            <span className="text-sm text-slate-400">{count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: st.dot.replace('bg-', '').includes('yellow') ? '#facc15' : st.dot.replace('bg-', '').includes('green') ? '#4ade80' : st.dot.replace('bg-', '').includes('red') ? '#f87171' : '#64748b' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Dernières inscriptions */}
                <div className="neon-card rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-cyan-400/15 flex items-center justify-between">
                    <h3 className="text-white font-semibold">Dernières inscriptions</h3>
                    <button onClick={() => setTab('shops')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      Voir tout <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    {shops.slice(0, 5).map((shop, i) => {
                      const st = STATUS[shop.subscription_status] ?? STATUS.canceled
                      return (
                        <div key={shop.id} className={`flex items-center gap-4 px-5 py-3 ${i < 4 ? 'border-b border-slate-800/50' : ''}`}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                            style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee' }}>
                            {shop.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{shop.name}</p>
                            <p className="text-xs text-slate-500 truncate">{shop.admin_email}</p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.badge}`}>{st.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── BURALISTES ── */}
            {tab === 'shops' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Buralistes</h2>
                  <p className="text-slate-500 text-sm mt-0.5">{shops.length} inscrits au total</p>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Rechercher…"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-cyan-400/50"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'active', 'trial', 'past_due', 'canceled'].map(s => (
                      <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          filterStatus === s
                            ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30'
                            : 'text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}>
                        {s === 'all' ? 'Tous' : STATUS[s]?.label ?? s}
                        <span className="ml-1.5 text-slate-500">
                          {s === 'all' ? shops.length : shops.filter(sh => sh.subscription_status === s).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="neon-card rounded-2xl overflow-hidden">
                  {loading ? (
                    <div className="p-12 text-center text-slate-400">Chargement...</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">Aucun résultat</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wide">
                            <th className="text-left px-5 py-3">Boutique</th>
                            <th className="text-left px-5 py-3">Statut</th>
                            <th className="text-left px-5 py-3 hidden lg:table-cell">Fin essai</th>
                            <th className="text-left px-5 py-3 hidden lg:table-cell">Inscrit</th>
                            <th className="text-right px-5 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((shop, i) => {
                            const st = STATUS[shop.subscription_status] ?? STATUS.canceled
                            const trialDays = shop.trial_ends_at
                              ? Math.ceil((new Date(shop.trial_ends_at).getTime() - Date.now()) / 86400000)
                              : null
                            return (
                              <tr key={shop.id} className={`${i < filtered.length - 1 ? 'border-b border-slate-800/50' : ''} hover:bg-white/[0.015] transition-colors`}>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                      style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee' }}>
                                      {shop.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium text-white truncate">{shop.name}</p>
                                      <p className="text-xs text-slate-500 truncate">{shop.admin_email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.badge}`}>{st.label}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 hidden lg:table-cell">
                                  {trialDays !== null ? (
                                    <span className={`text-xs ${trialDays <= 3 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                      {trialDays > 0 ? `J-${trialDays}` : 'Expiré'}
                                    </span>
                                  ) : <span className="text-slate-600">—</span>}
                                </td>
                                <td className="px-5 py-4 hidden lg:table-cell text-slate-400 text-xs">
                                  {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center justify-end gap-2">
                                    {shop.stripe_customer_id && (
                                      <button onClick={() => fetchInvoices(shop)}
                                        className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-400/25 px-2.5 py-1.5 rounded-lg transition-colors">
                                        <FileText className="w-3 h-3" />
                                        Factures
                                      </button>
                                    )}
                                    {shop.stripe_subscription_id && shop.subscription_status === 'active' && (
                                      <button onClick={() => cancelSubscription(shop)}
                                        disabled={cancelingId === shop.id}
                                        className="text-xs text-red-400 hover:text-red-300 border border-red-400/25 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                                        {cancelingId === shop.id ? '...' : 'Annuler'}
                                      </button>
                                    )}
                                    <a href={`https://tabacfrance.fr/${shop.slug}`} target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors">
                                      <ExternalLink className="w-3 h-3" />
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
            )}

            {/* ── REVENUS ── */}
            {tab === 'revenue' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Revenus</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Estimation basée sur les abonnements actifs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'MRR estimé',  value: `${stats.mrr.toFixed(2)} €`,                color: '#22d3ee', sub: `${stats.active} abonné(s) × ${FLEX_PRICE} €` },
                    { label: 'ARR estimé',  value: `${(stats.mrr * 12).toFixed(0)} €`,          color: '#d946ef', sub: 'Revenu annuel récurrent' },
                    { label: 'Potentiel',   value: `${((stats.active + stats.trial) * FLEX_PRICE).toFixed(0)} €`, color: '#4ade80', sub: `Si tous les essais convertissent` },
                  ].map(k => (
                    <div key={k.label} className="neon-card rounded-2xl p-5">
                      <div className="text-slate-500 text-xs mb-2">{k.label}</div>
                      <div className="text-3xl font-black" style={{ color: k.color }}>{k.value}</div>
                      <div className="text-slate-500 text-xs mt-1">{k.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="neon-card rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-4">Détail par plan</h3>
                  <div className="space-y-3">
                    {[
                      { plan: 'Flex (19,90 €/mois)', count: stats.active, mrr: stats.active * FLEX_PRICE, color: '#22d3ee' },
                      { plan: 'Engagement (14,90 €/mois)', count: 0, mrr: 0, color: '#d946ef' },
                    ].map(p => (
                      <div key={p.plan} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                          <span className="text-sm text-slate-300">{p.plan}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-white">{p.mrr.toFixed(2)} €</span>
                          <span className="text-xs text-slate-500 ml-2">{p.count} client(s)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="neon-card rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">Dashboard Stripe complet</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Voir toutes les transactions, remboursements et factures</p>
                    </div>
                    <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-400/25 px-4 py-2 rounded-xl transition-colors">
                      Ouvrir Stripe <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Modal factures */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="neon-card rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-cyan-400/20 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Factures — {selectedShop.name}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{selectedShop.admin_email}</p>
              </div>
              <button onClick={() => setSelectedShop(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {!selectedShop.stripe_customer_id ? (
                <p className="text-slate-400 text-center py-6">Pas encore de client Stripe</p>
              ) : invoicesLoading ? (
                <p className="text-slate-400 text-center py-6">Chargement...</p>
              ) : invoices.length === 0 ? (
                <p className="text-slate-400 text-center py-6">Aucune facture</p>
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
                            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-400/30 px-2.5 py-1.5 rounded-lg">
                            <FileText className="w-3 h-3" /> PDF
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
