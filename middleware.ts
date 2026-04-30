import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Injecter le slug du shop dans les headers pour les Server Components
  const slug = host.split('.')[0]
  const response = NextResponse.next()
  response.headers.set('x-shop-slug', slug)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
