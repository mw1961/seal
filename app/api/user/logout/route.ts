import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.redirect('/login');
  response.cookies.set('seal_user', '', { maxAge: 0, path: '/' });
  return response;
}
