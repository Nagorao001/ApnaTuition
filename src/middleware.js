import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Public routes
  if (pathname === '/login' || pathname.startsWith('/api/auth/login') || pathname === '/') {
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/student'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads/).*)'],
};
