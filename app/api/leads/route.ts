import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const { email, firstName, shopName, city } = await req.json()

  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.contacts.create({
      email,
      firstName: firstName || '',
      lastName: shopName || '',
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID!,
    })
  }

  return NextResponse.json({ ok: true })
}
