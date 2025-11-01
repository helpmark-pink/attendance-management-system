import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  const token = request.cookies.get('session')?.value;

  // Early return for root path
  if (pathname === '/') {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Only verify token when necessary (accessing protected routes or public paths with token)
  if (token && (isPublicPath || !isPublicPath)) {
    try {
      await jwtVerify(token, JWT_SECRET);

      // If authenticated and trying to access login/register, redirect to dashboard
      if (isPublicPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Invalid token - only redirect if accessing protected route
      if (!isPublicPath) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('session');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // More specific matcher to reduce unnecessary middleware execution
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
