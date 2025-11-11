import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Proteger rutas de dashboard
    if (path.startsWith('/dashboard') && !token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Proteger rutas de admin
    if (path.startsWith('/admin') && token?.role !== 'PLATFORM_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Proteger rutas de negocio para dueños
    if (path.startsWith('/dashboard/negocio') && token?.role !== 'BUSINESS_OWNER') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};

