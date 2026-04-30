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

  return <ShopClientLayout slug={slug}>{children}</ShopClientLayout>
}
