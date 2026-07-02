import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// WAJIB gunakan "export function proxy", dilarang menggunakan "export default"
export function proxy(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value;
  const path = request.nextUrl.pathname;

  // 1. Jika belum login, dilarang masuk ke dashboard
  if (path.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Jika SUDAH login, dilarang kembali ke halaman login
  if ((path === '/login' || path === '/') && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};