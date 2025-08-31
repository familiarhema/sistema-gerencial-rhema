import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token');

  if (!token) {
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { success: true },
    { status: 200 }
  );
}