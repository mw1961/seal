import { NextRequest, NextResponse } from 'next/server';
import { createHash, createHmac } from 'crypto';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH
  ?? '97545561b1f38ddb31fdbbba42ae46f46c3f05280374e2555f60981d29543e96'; // mw10

const SESSION_SECRET = process.env.SESSION_SECRET ?? 'seal-dev-secret-2026';

export const ADMIN_TOKEN = createHmac('sha256', SESSION_SECRET).update('admin').digest('hex');

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  const hash = createHash('sha256').update(password.trim()).digest('hex');

  if (hash !== ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('seal_admin', ADMIN_TOKEN, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8,
    path: '/',
  });

  return response;
}
