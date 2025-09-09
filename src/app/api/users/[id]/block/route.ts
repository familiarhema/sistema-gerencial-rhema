import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const url = `${config.externalApiUrl}/users/${id}/block`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter bloquear/desbloquear usuário');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao bloquear/desbloquear usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar bloquear/desbloquear usuário' },
      { status: 500 }
    );
  }
}