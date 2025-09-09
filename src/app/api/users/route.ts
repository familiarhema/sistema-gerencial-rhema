import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const active = searchParams.get('active');
    const blocked = searchParams.get('blocked');

    // Construir URL com query params
    const queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (email) queryParams.append('email', email);
    if (active) queryParams.append('active', active);
    if (blocked) queryParams.append('blocked', blocked);

    const url = `${config.externalApiUrl}/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter usuarios');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar usuarios:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuarios' },
      { status: 500 }
    );
  }
}