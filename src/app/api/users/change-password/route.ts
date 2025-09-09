import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest
) {
  try {
    const url = `${config.externalApiUrl}/users/change-password`;

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
      throw new Error('Falha ao alterar senha usuário');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao alterar senha usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar alterar senha usuário' },
      { status: 500 }
    );
  }
}