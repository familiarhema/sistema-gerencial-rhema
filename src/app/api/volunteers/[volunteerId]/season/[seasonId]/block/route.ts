import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ volunteerId: string; seasonId: string }> }
) {
  try {
    const { volunteerId, seasonId } = await params;

    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Motivo do bloqueio é obrigatório' },
        { status: 400 }
      );
    }

    const url = `${config.externalApiUrl}/volunteers/${volunteerId}/season/${seasonId}/block`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
      body: JSON.stringify({ reason: reason.trim() }),
    });

    if (!response.ok) {
      throw new Error('Falha ao bloquear voluntário');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao bloquear voluntário:', error);
    return NextResponse.json(
      { error: 'Erro ao bloquear voluntário' },
      { status: 500 }
    );
  }
}