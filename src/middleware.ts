// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public routes
  if (path.startsWith('/login') || 
      path.startsWith('/register') || 
      path.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const userId = request.cookies.get('user_id')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Not logged in → redirect to login
  if (!userId || !userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based route protection
  if (userRole === 'EMPLOYEE') {
    if (path === '/tickets' || path.startsWith('/tickets/assigned')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (userRole === 'IT_STAFF') {
    if (path === '/tickets' || path.startsWith('/tickets/new')) {
      return NextResponse.redirect(new URL('/tickets/assigned', request.url));
    }
  }

  if (userRole === 'IT_MANAGER') {
    if (path.startsWith('/tickets/new')) {
      return NextResponse.redirect(new URL('/tickets', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*\\..*).*)',
  ],
};