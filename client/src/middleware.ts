import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/',
  '/maintenance',
  '/complaints',
  '/emergency',
  '/admin',
];

// Routes that are only for non-authenticated users
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/manager-setup',
];

// Public routes accessible without authentication
const publicRoutes = [
  '/showcase',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the auth token from cookies
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;

  // Skip middleware for public routes
  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if current path matches protected routes
  const isProtectedRoute = protectedRoutes.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );
  
  // Check if current path matches auth routes
  const isAuthRoute = authRoutes.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );

  // Redirect authenticated users away from auth pages (except manager-setup check is done on page)
  if (isAuthenticated && isAuthRoute && pathname !== '/manager-setup') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
