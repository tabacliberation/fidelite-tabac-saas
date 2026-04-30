import { NextRequest, NextResponse } from 'next/server'

const SUPERADMIN_COOKIE = 'superadmin_session'
const SUPERADMIN_VALUE = 'tabacfrance_superadmin_2026'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protection super admin
  if (pathname.startsWith('/superadmin') && pathname !== '/superadmin/login') {
    const cookie = request.cookies.get(SUPERADMIN_COOKIE)
    if (cookie?.value !== SUPERADMIN_VALUE) {
      return NextResponse.redirect(new URL('/superadmin/login', request.url))
    }
  }

  const host = request.headers.get('host') || ''
  const slug = host.split('.')[0]
  const response = NextResponse.next()
  response.headers.set('x-shop-slug', slug)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
