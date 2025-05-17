import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const protectedRoutes = ['/interview-prep']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )

  if (isProtectedRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    })

    console.log('Token:', token)

    if (!token) {
      const signInUrl = new URL('/api/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/interview-prep', '/interview-prep/:path*'],
}
