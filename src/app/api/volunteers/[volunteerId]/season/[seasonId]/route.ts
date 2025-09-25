import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ volunteerId: string; seasonId: string }> }
) {
  try {
    const { volunteerId, seasonId } = await params;

    const url = `${config.externalApiUrl}/volunteers/${volunteerId}/season/${seasonId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao desinscrever voluntário da temporada');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao desinscrever voluntário:', error);
    return NextResponse.json(
      { error: 'Erro ao desinscrever voluntário' },
      { status: 500 }
    );
  }
}