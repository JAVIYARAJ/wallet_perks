import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Edge Middleware for Role-Based API & Route Protection
 * - Enforces authentication headers or session cookies for protected endpoints.
 * - Restricts /api/admin/* endpoints exclusively to users with the 'admin' role.
 * - Restricts /admin route to admin users.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Extract Role & User ID from request headers or authorization cookies
  const roleHeader = request.headers.get('x-user-role') || request.headers.get('x-role')
  const userHeader = request.headers.get('x-user-id') || request.headers.get('x-user-email')
  
  // Also check cookie session fallback if present
  const authCookie = request.cookies.get('user_role')?.value || request.cookies.get('role')?.value

  const effectiveRole = (roleHeader || authCookie || '').toLowerCase()

  // 2. Protect Admin API routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    // Require admin role for all /api/admin/* routes
    if (effectiveRole !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          status: 403,
          code: 'PERMISSION_DENIED',
          error: 'Forbidden: Admin access required.',
          message: 'Access Denied: You do not have the required administrative permissions to perform actions on this endpoint.',
          details: {
            path: pathname,
            requiredRole: 'admin',
            currentRole: effectiveRole || 'unassigned',
            action: 'Forbidden role access attempt blocked by API security middleware',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }
  }

  // 3. Protect Admin Dashboard Frontend Route (/admin)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    if (effectiveRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      url.searchParams.set('required', 'admin')
      url.searchParams.set('current', effectiveRole || 'unauthenticated')
      url.searchParams.set('path', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Apply middleware to API admin routes and dashboard pages
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/admin/:path*',
  ],
}
