import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();
    const tavoli = await sql`SELECT * FROM tavoli ORDER BY numero`;
    return NextResponse.json({ tavoli });
  } catch (error) {
    console.error('GET /api/tavoli error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { id, stato } = body;

    const result = await sql`
      UPDATE tavoli SET stato = ${stato} WHERE id = ${id} RETURNING *
    `;

    return NextResponse.json({ tavolo: result[0] });
  } catch (error) {
    console.error('PUT /api/tavoli error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}
