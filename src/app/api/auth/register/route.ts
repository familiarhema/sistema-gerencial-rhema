import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest
) {
  try {
    const url = `${config.externalApiUrl}/auth/register`;

    const body = await request.json();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Falha ao criar usuário');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar criar usuário' },
      { status: 500 }
    );
  }
}