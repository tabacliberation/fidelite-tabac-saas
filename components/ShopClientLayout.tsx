'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import BottomNav from './BottomNav'
import PWAInstallBanner from './PWAInstallBanner'

export default function ShopClientLayout({ slug, shopName, children }: { slug: string; shopName: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.includes('/admin')

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  if (isAdmin) {
    return (
      <div className="min-h-screen" style={{ background: '#06061a' }}>
        <div className="fixed inset-0 neon-grid pointer-events-none" style={{ opacity: 0.3 }} />
        <div className="relative min-h-screen max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#06061a' }}>
      <div className="relative min-h-screen pb-20">
        {children}
        <BottomNav slug={slug} />
        <PWAInstallBanner slug={slug} shopName={shopName} />
      </div>
    </div>
  )
}
