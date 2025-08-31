import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );

  // Remove o cookie de autenticação
  response.cookies.delete('auth_token');

  return response;
}