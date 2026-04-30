'use client'

export default function LoyaltyCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 animate-pulse"
      style={{ background: 'rgba(10,12,35,0.8)', border: '1px solid rgba(34,211,238,0.08)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl" style={{ background: 'rgba(34,211,238,0.06)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded w-32" style={{ background: 'rgba(34,211,238,0.07)' }} />
          <div className="h-2 rounded w-20" style={{ background: 'rgba(34,211,238,0.04)' }} />
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full" style={{ background: 'rgba(34,211,238,0.05)' }} />
        ))}
      </div>
      <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}
