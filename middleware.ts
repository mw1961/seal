import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET ?? 'seal-dev-secret-2026';

const ADMIN_TOKEN = createHmac('sha256', SESSION_SECRET).update('admin').digest('hex');
const USER_TOKEN  = createHmac('sha256', SESSION_SECRET).update('user:123').digest('hex');

const ADMIN_PATHS = ['/admin'];
const PUBLIC_PATHS = [
  '/login',
  '/login/client',
  '/admin/login',
  '/api/user/login',
  '/api/user/logout',
  '/api/admin/login',
  '/api/admin/logout',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const isAdminPath = ADMIN_PATHS.some(p => pathname.startsWith(p));

  if (isAdminPath) {
    const token = req.cookies.get('seal_admin')?.value;
    if (token !== ADMIN_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  // All other routes require valid user OR admin token
  const userToken  = req.cookies.get('seal_user')?.value;
  const adminToken = req.cookies.get('seal_admin')?.value;

  if (userToken !== USER_TOKEN && adminToken !== ADMIN_TOKEN) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
