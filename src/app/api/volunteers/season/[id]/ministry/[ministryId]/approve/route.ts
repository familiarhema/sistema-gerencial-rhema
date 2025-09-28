import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ministryId: string }> }
) {
  try {
    const { id, ministryId } = await params;

    const body = await request.json();
    const { volunteerIds } = body;

    if (!volunteerIds || !Array.isArray(volunteerIds) || volunteerIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs dos voluntários são obrigatórios' },
        { status: 400 }
      );
    }

    const url = `${config.externalApiUrl}/volunteers/season/${id}/ministry/${ministryId}/approve`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
      body: JSON.stringify({ volunteerIds }),
    });


    if (!response.ok) {
      throw new Error('Falha ao aprovar voluntários em lote');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao aprovar voluntários em lote:', error);
    return NextResponse.json(
      { error: 'Erro ao aprovar voluntários em lote' },
      { status: 500 }
    );
  }
}