import { getShopBySlug } from '@/lib/getShop'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const shop = await getShopBySlug(slug)
  const name = shop?.name ?? 'TabacFrance'

  return NextResponse.json({
    name: `${name} — Fidélité`,
    short_name: name,
    description: `Programme de fidélité de ${name}`,
    start_url: `/${slug}/dashboard`,
    scope: `/${slug}/`,
    display: 'standalone',
    background_color: '#06061a',
    theme_color: '#22d3ee',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }, {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
