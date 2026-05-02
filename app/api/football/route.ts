import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const COMPETITIONS = '2015,2001,2021,2002,2019,2014'
const API_KEY = process.env.FOOTBALL_DATA_API_KEY ?? '472071831716417494ad34d3eb0944f1'

export async function GET() {
  const today = new Date()
  const in2Days = new Date(today)
  in2Days.setDate(in2Days.getDate() + 2)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/matches?competitions=${COMPETITIONS}&dateFrom=${fmt(today)}&dateTo=${fmt(in2Days)}`,
      {
        headers: { 'X-Auth-Token': API_KEY },
        cache: 'no-store',
      }
    )
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    return NextResponse.json({ matches: data.matches ?? [] }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return NextResponse.json({ matches: [], error: String(e) }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
