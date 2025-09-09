import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = `${config.externalApiUrl}/ministries/active`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter ministérios ativos');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar ministérios:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ministérios' },
      { status: 500 }
    );
  }
}