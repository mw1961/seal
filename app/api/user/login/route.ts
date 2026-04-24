import { NextRequest, NextResponse } from 'next/server';
import { createHash, createHmac } from 'crypto';

const USER_HASH = process.env.USER_PASSWORD_HASH
  ?? '3709cbe95c1e01aeb65f909daf7c1733bed0ddb7b826b426a209fe106a4bd0c2'; // mw11

const SESSION_SECRET = process.env.SESSION_SECRET ?? 'seal-dev-secret-2026';

export const USER_TOKEN = createHmac('sha256', SESSION_SECRET).update('user:123').digest('hex');

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const hash = createHash('sha256').update(password.trim()).digest('hex');

  if (username.trim() !== '123' || hash !== USER_HASH) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('seal_user', USER_TOKEN, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8,
    path: '/',
  });

  return response;
}
