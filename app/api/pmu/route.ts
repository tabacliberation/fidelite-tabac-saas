import { NextResponse } from 'next/server'

export async function GET() {
  const now = new Date()
  const day   = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year  = now.getFullYear()
  const dateStr = `${day}${month}${year}` // DDMMYYYY

  try {
    const res = await fetch(
      `https://online.turfinfo.api.pmu.fr/rest/client/1/programme/${dateStr}/reunions?specialisation=INTERNET`,
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) throw new Error(`PMU API ${res.status}`)
    const data = await res.json()
    // data.reunions is the array
    return NextResponse.json({ reunions: data.reunions ?? [] })
  } catch (e) {
    return NextResponse.json({ reunions: [], error: String(e) })
  }
}
