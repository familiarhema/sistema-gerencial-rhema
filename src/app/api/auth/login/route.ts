import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${config.externalApiUrl}/${config.endpoints.auth.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Falha na autenticação');
    }

    const data = await response.json();

    // Configurar o cookie http-only com o token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      // Expira em 1 hora
      maxAge: 60 * 60,
    };

    const authResponse = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Definir o cookie com o token
    authResponse.cookies.set('auth_token', data.access_token, cookieOptions);

    return authResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Credenciais inválidas' 
      },
      { status: 401 }
    );
  }
}