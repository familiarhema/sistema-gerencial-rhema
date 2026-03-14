import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const url = `${config.externalApiUrl}/volunteers/season/${id}/list`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter frequência de voluntários por célula');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar frequência de voluntários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar frequência de voluntários' },
      { status: 500 }
    );
  }
}