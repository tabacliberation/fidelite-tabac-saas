import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const COOKIE_NAME = 'superadmin_session'
const COOKIE_VALUE = 'tabacfrance_superadmin_2026'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function isAuth() {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE
}

export async function GET(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const customerId = req.nextUrl.searchParams.get('customerId')
  if (!customerId) return NextResponse.json({ error: 'Missing customerId' }, { status: 400 })

  const invoices = await stripe.invoices.list({ customer: customerId, limit: 20 })
  return NextResponse.json({
    invoices: invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount_paid / 100,
      status: inv.status,
      date: inv.created,
      pdf: inv.invoice_pdf,
    }))
  })
}
