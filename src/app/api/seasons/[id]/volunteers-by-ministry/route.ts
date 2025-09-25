import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: seasonId } = await params;
    const url = `${config.externalApiUrl}/seasons/${seasonId}/volunteers-by-ministry`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter voluntários por ministério');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar voluntários por ministério:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar voluntários por ministério' },
      { status: 500 }
    );
  }
}