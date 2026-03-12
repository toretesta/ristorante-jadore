import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');

    let prenotazioni;
    if (data) {
      prenotazioni = await sql`SELECT * FROM prenotazioni WHERE data = ${data} ORDER BY ora`;
    } else {
      prenotazioni = await sql`SELECT * FROM prenotazioni ORDER BY data DESC, ora`;
    }

    return NextResponse.json({ prenotazioni });
  } catch (error) {
    console.error('GET /api/prenotazioni error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { nome, data, ora, persone, tavolo_id, telefono, note, stato } = body;

    const result = await sql`
      INSERT INTO prenotazioni (nome, data, ora, persone, tavolo_id, telefono, note, stato)
      VALUES (${nome}, ${data}, ${ora}, ${persone || 2}, ${tavolo_id || null}, ${telefono || ''}, ${note || ''}, ${stato || 'in_attesa'})
      RETURNING *
    `;

    return NextResponse.json({ prenotazione: result[0] });
  } catch (error) {
    console.error('POST /api/prenotazioni error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { id, stato } = body;

    const result = await sql`
      UPDATE prenotazioni SET stato = ${stato} WHERE id = ${id} RETURNING *
    `;

    return NextResponse.json({ prenotazione: result[0] });
  } catch (error) {
    console.error('PUT /api/prenotazioni error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 });

    await sql`DELETE FROM prenotazioni WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/prenotazioni error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
