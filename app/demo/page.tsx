'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoPage() {
  const router = useRouter()
  const called = useRef(false)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    if (called.current) return
    called.current = true

    fetch('/api/demo')
      .then(r => r.json())
      .then(data => {
        if (data.slug) {
          router.replace(`/${data.slug}`)
        } else {
          setErrMsg(JSON.stringify(data))
        }
      })
      .catch(e => setErrMsg(e.message))
  }, [router])

  if (errMsg) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white gap-4 px-6">
        <p className="text-red-400 font-bold">Erreur démo :</p>
        <pre className="text-xs text-gray-400 bg-white/5 p-4 rounded-xl max-w-lg w-full overflow-auto">{errMsg}</pre>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white gap-6 px-6">
      <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
      <div className="text-center">
        <p className="text-white font-bold text-lg mb-1">Préparation de la démo...</p>
        <p className="text-gray-500 text-sm">Vous allez voir l&apos;application comme un client</p>
      </div>
    </div>
  )
}
