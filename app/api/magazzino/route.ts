import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();
    const ingredienti = await sql`SELECT * FROM ingredienti ORDER BY nome`;
    return NextResponse.json({ ingredienti });
  } catch (error) {
    console.error('GET /api/magazzino error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { nome, quantita, unita, minimo_scorta } = body;

    const result = await sql`
      INSERT INTO ingredienti (nome, quantita, unita, minimo_scorta)
      VALUES (${nome}, ${quantita || 0}, ${unita || 'kg'}, ${minimo_scorta || 0})
      RETURNING *
    `;

    return NextResponse.json({ ingrediente: result[0] });
  } catch (error) {
    console.error('POST /api/magazzino error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiunta' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { id, quantita } = body;

    const result = await sql`
      UPDATE ingredienti SET quantita = ${quantita} WHERE id = ${id} RETURNING *
    `;

    return NextResponse.json({ ingrediente: result[0] });
  } catch (error) {
    console.error('PUT /api/magazzino error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 });

    await sql`DELETE FROM ingredienti WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/magazzino error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
