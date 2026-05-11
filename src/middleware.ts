// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Debugging
  console.log(`🔍 Middleware hit: ${path} | Role: ${request.cookies.get('user_role')?.value || 'No role'}`);

  // Public routes
  if (path.startsWith('/login') || 
      path.startsWith('/register') || 
      path.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const userId = request.cookies.get('user_id')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  if (!userId) {
    console.log(`🚫 Not logged in → redirect to /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based blocking
  if (userRole === 'EMPLOYEE') {
    if (path === '/tickets' || path.startsWith('/tickets/assigned')) {
      console.log(`🚫 EMPLOYEE blocked from ${path} → /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (userRole === 'IT_STAFF') {
    if (path === '/tickets' || path.startsWith('/tickets/new')) {
      console.log(`🚫 IT_STAFF blocked from ${path}`);
      return NextResponse.redirect(new URL('/tickets/assigned', request.url));
    }
  }

  if (userRole === 'IT_MANAGER') {
    if (path.startsWith('/tickets/new')) {
      console.log(`🚫 IT_MANAGER blocked from ${path}`);
      return NextResponse.redirect(new URL('/tickets', request.url));
    }
  }

  return NextResponse.next();
}

// BROADEST MATCHER - Dapat gumana 'to
export const config = {
  matcher: '/((?!_next/|api/auth/|favicon.ico|.*\\..*\\..*).*)',
};