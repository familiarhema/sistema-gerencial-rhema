import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const ministerioId = searchParams.get('ministerioId');

    // Construir URL com query params
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    if (name) queryParams.append('name', name);
    if (email) queryParams.append('email', email);
    if (ministerioId) queryParams.append('ministerioId', ministerioId);

    const { id } = await params;

    const url = `${config.externalApiUrl}/volunteers/season/${id}?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter voluntários da temporada');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar voluntários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar voluntários' },
      { status: 500 }
    );
  }
}