import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Competitions: Ligue 1, Champions League, Premier League, Bundesliga, Serie A, La Liga
const COMPETITIONS = '2015,2001,2021,2002,2019,2014'

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ matches: [], noKey: true }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const today = new Date()
  const in2Days = new Date(today)
  in2Days.setDate(in2Days.getDate() + 2)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/matches?competitions=${COMPETITIONS}&dateFrom=${fmt(today)}&dateTo=${fmt(in2Days)}`,
      {
        headers: { 'X-Auth-Token': apiKey },
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
