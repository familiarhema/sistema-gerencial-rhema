import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ volunteerId: string; seasonId: string }> }
) {
  try {
    const { volunteerId, seasonId } = await params;
    const body = await request.json();

    const url = `${config.externalApiUrl}/volunteers/${volunteerId}/season/${seasonId}/attended-volunteers-day`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Falha ao marcar comparecimento do voluntário');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao marcar comparecimento do voluntário:', error);
    return NextResponse.json(
      { error: 'Erro ao marcar comparecimento do voluntário' },
      { status: 500 }
    );
  }
}