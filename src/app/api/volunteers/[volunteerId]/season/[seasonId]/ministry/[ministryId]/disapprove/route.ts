import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ volunteerId: string; seasonId: string; ministryId: string }> }
) {
  try {
    const { volunteerId, seasonId, ministryId } = await params;

    const url = `${config.externalApiUrl}/volunteers/${volunteerId}/season/${seasonId}/ministry/${ministryId}/disapprove`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao reprovar voluntário');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao reprovar voluntário:', error);
    return NextResponse.json(
      { error: 'Erro ao reprovar voluntário' },
      { status: 500 }
    );
  }
}