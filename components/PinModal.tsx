'use client'

import { useState } from 'react'
import { X, Delete } from 'lucide-react'

interface Props {
  onConfirm: (pin: string) => void
  onClose: () => void
  loading?: boolean
  title?: string
}

export default function PinModal({ onConfirm, onClose, loading, title = 'Code PIN Admin' }: Props) {
  const [pin, setPin] = useState('')

  const handleKey = (val: string) => {
    if (pin.length < 6) setPin(p => p + val)
  }
  const handleDelete = () => setPin(p => p.slice(0, -1))
  const handleSubmit = () => { if (pin.length >= 4) onConfirm(pin) }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-sm p-6 rounded-t-3xl"
        style={{ background: 'rgba(10,12,35,0.97)', borderTop: '1px solid rgba(34,211,238,0.3)', boxShadow: '0 -8px 40px rgba(34,211,238,0.12)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: '#22d3ee', textShadow: '0 0 8px #22d3ee' }}>{title}</h2>
          <button onClick={onClose} style={{ color: '#475569' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full border-2 transition-all"
              style={i < pin.length
                ? { background: '#22d3ee', borderColor: '#22d3ee', boxShadow: '0 0 8px rgba(34,211,238,0.8)' }
                : { background: 'transparent', borderColor: 'rgba(34,211,238,0.25)' }
              }
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {keys.map(k => (
            <button key={k} onClick={() => handleKey(k)}
              className="h-14 rounded-2xl text-white text-xl font-bold transition-all active:scale-95"
              style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}
            >
              {k}
            </button>
          ))}
          <button onClick={handleDelete}
            className="h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)', color: '#64748b' }}
          >
            <Delete className="w-5 h-5" />
          </button>
          <button onClick={() => handleKey('0')}
            className="h-14 rounded-2xl text-white text-xl font-bold transition-all active:scale-95"
            style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}
          >
            0
          </button>
          <button onClick={handleSubmit} disabled={pin.length < 4 || loading}
            className="h-14 rounded-2xl text-sm font-black disabled:opacity-40 transition-all active:scale-95"
            style={{ background: 'rgba(34,211,238,0.18)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.5)', boxShadow: '0 0 16px rgba(34,211,238,0.2)' }}
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
              : 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}
