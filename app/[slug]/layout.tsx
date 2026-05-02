import { getShopBySlug } from '@/lib/getShop'
import { notFound } from 'next/navigation'
import ShopClientLayout from '@/components/ShopClientLayout'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const shop = await getShopBySlug(slug)
  const name = shop?.name ?? 'TabacFrance'
  return {
    title: `${name} — Fidélité`,
    description: `Programme de fidélité de ${name}`,
    manifest: `/${slug}/manifest.json`,
    appleWebApp: { capable: true, title: name, statusBarStyle: 'black-translucent' },
    icons: { icon: '/icon.svg', apple: '/icon-192.svg' },
  }
}

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const shop = await getShopBySlug(slug)

  if (!shop) notFound()

  if (shop.subscription_status === 'canceled') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-6">
        <div>
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Application suspendue</h1>
          <p className="text-gray-400">Contactez votre buraliste pour plus d&apos;informations.</p>
        </div>
      </div>
    )
  }

  const trialExpired =
    shop.subscription_status === 'trial' &&
    shop.trial_ends_at !== null &&
    new Date(shop.trial_ends_at) < new Date()

  if (trialExpired) {
    const TrialExpiredPage = (await import('@/components/TrialExpiredPaywall')).default
    return <TrialExpiredPage slug={slug} shopName={shop.name} />
  }

  const pastDueBanner = shop.subscription_status === 'past_due' ? (
    <a
      href={`/${slug}/admin/abonnement`}
      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-bold"
      style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', borderBottom: '1px solid rgba(248,113,113,0.3)' }}
    >
      ⚠️ Paiement échoué — Mettre à jour mes informations de paiement →
    </a>
  ) : null

  return (
    <>
      {pastDueBanner}
      <ShopClientLayout slug={slug} shopName={shop.name}>{children}</ShopClientLayout>
    </>
  )
}
