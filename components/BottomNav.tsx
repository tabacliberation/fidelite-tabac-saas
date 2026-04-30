'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutDashboard, Gift, User } from 'lucide-react'

export default function BottomNav({ slug }: { slug: string }) {
  const pathname = usePathname()

  const navItems = [
    { href: `/${slug}`,            label: 'Vitrine',    icon: Home            },
    { href: `/${slug}/dashboard`,  label: 'Mes cartes', icon: LayoutDashboard },
    { href: `/${slug}/offers`,     label: 'Offres',     icon: Gift            },
    { href: `/${slug}/profile`,    label: 'Profil',     icon: User            },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
      style={{ background: 'rgba(6,6,26,0.95)', borderTop: '1px solid rgba(34,211,238,0.2)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex justify-around max-w-sm mx-auto px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 py-3 px-3 transition-all relative">
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }}
                />
              )}
              <Icon className="w-5 h-5 transition-all"
                style={active ? { color: '#22d3ee', filter: 'drop-shadow(0 0 6px #22d3ee)' } : { color: '#475569' }}
              />
              <span className="text-[10px] font-bold tracking-wide"
                style={active ? { color: '#22d3ee' } : { color: '#475569' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
