import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// WAJIB bernama "middleware" (huruf kecil semua) dan di-export
export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value;

  // Jika mencoba masuk ke /dashboard tapi BELUM login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika SUDAH login, tapi iseng mencoba buka halaman /login atau /
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/') && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// WAJIB bernama "config"
export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};