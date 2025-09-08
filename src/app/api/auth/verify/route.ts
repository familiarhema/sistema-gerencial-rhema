import { NextRequest, NextResponse } from 'next/server';
import {jwtDecode} from 'jwt-decode';

interface UserData {
  email: string;
  name: string;
  sub: string;
  role: {
    id: string;
    name: string;
  };
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token');

  if (!token) {
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );
  }

  try {
    const decoded = jwtDecode<UserData>(token.value);
    
    return NextResponse.json(
      {
        success: true,
        user: decoded
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );
  }
}