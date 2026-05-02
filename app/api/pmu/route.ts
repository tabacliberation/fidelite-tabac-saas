import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date()
  const day   = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year  = now.getFullYear()
  const dateStr = `${day}${month}${year}`

  const urls = [
    `https://online.turfinfo.api.pmu.fr/rest/client/1/programme/${dateStr}/reunions?specialisation=INTERNET`,
    `https://turfinfo.api.pmu.fr/rest/client/1/programme/${dateStr}/reunions`,
  ]

  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'fr-FR,fr;q=0.9',
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Referer': 'https://www.pmu.fr/',
    'Origin': 'https://www.pmu.fr',
  }

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers, cache: 'no-store' })
      if (!res.ok) continue
      const data = await res.json()
      const reunions = data.reunions ?? data ?? []
      return NextResponse.json(
        { reunions: Array.isArray(reunions) ? reunions : [] },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    } catch {
      continue
    }
  }

  // Fallback : données fictives pour aujourd'hui si API indisponible
  return NextResponse.json({ reunions: [], unavailable: true }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
