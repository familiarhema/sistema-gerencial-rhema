import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const active = searchParams.get('active');

    // Construir URL com query params
    const queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (active) queryParams.append('active', active);

    const url = `${config.externalApiUrl}/seasons${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter temporadas');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar temporadas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar temporadas' },
      { status: 500 }
    );
  }
}