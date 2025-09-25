import { config } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; volunteerId: string }> }
) {
  try {
    const { id, volunteerId } = await params;

    const url = `${config.externalApiUrl}/seasons/${id}/volunteer/${volunteerId}`;

    const body = await request.json();

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar voluntário na temporada');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar voluntário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar voluntário' },
      { status: 500 }
    );
  }
}