import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.redirect('/admin/login');
  response.cookies.set('seal_admin', '', { maxAge: 0, path: '/' });
  return response;
}
