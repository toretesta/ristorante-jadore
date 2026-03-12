/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const tavoli = await sql`SELECT * FROM tavoli WHERE id = ${parseInt(id)}`;
      if (tavoli.length === 0) return NextResponse.json({ error: 'Tavolo non trovato' }, { status: 404 });
      const tavolo = tavoli[0];

      const ordini = await sql`
        SELECT * FROM ordini
        WHERE tavolo_id = ${tavolo.id} AND sessione_tavolo = ${tavolo.sessione_corrente}
        ORDER BY created_at DESC
      `;
      const ordiniIds = ordini.map((o: any) => o.id);
      let allPiatti: any[] = [];
      if (ordiniIds.length > 0) {
        allPiatti = await sql`SELECT * FROM ordini_piatti WHERE ordine_id = ANY(${ordiniIds})`;
      }
      const ordiniCompleti = ordini.map((o: any) => ({
        ...o,
        piatti: allPiatti.filter((p: any) => p.ordine_id === o.id),
      }));

      return NextResponse.json({ tavolo, ordini: ordiniCompleti });
    }

    const tavoli = await sql`SELECT * FROM tavoli ORDER BY numero`;
    return NextResponse.json({ tavoli });
  } catch (error) {
    console.error('GET /api/tavoli error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento' }, { status: 500 });
  }
}

// POST - Create new table
export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { numero, posti } = body;

    const result = await sql`
      INSERT INTO tavoli (numero, posti, stato, sessione_corrente)
      VALUES (${numero}, ${posti}, 'libero', 1)
      RETURNING *
    `;

    return NextResponse.json({ tavolo: result[0] });
  } catch (error) {
    console.error('POST /api/tavoli error:', error);
    return NextResponse.json({ error: 'Errore nella creazione del tavolo' }, { status: 500 });
  }
}

// PUT - Update table state or details
export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { id, stato, posti, numero, action } = body;

    // Explicit new session action
    if (action === 'nuova_sessione') {
      const result = await sql`
        UPDATE tavoli SET sessione_corrente = sessione_corrente + 1, stato = 'occupato'
        WHERE id = ${id} RETURNING *
      `;
      return NextResponse.json({ tavolo: result[0] });
    }

    // Edit table details (numero, posti)
    if (posti !== undefined || numero !== undefined) {
      const current = await sql`SELECT * FROM tavoli WHERE id = ${id}`;
      if (current.length === 0) return NextResponse.json({ error: 'Tavolo non trovato' }, { status: 404 });
      const result = await sql`
        UPDATE tavoli SET
          numero = ${numero !== undefined ? numero : current[0].numero},
          posti = ${posti !== undefined ? posti : current[0].posti},
          stato = ${stato !== undefined ? stato : current[0].stato}
        WHERE id = ${id} RETURNING *
      `;
      return NextResponse.json({ tavolo: result[0] });
    }

    // Simple state change (no session increment)
    const result = await sql`
      UPDATE tavoli SET stato = ${stato} WHERE id = ${id} RETURNING *
    `;

    return NextResponse.json({ tavolo: result[0] });
  } catch (error) {
    console.error('PUT /api/tavoli error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

// DELETE - Remove table
export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 });

    await sql`DELETE FROM tavoli WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tavoli error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione del tavolo' }, { status: 500 });
  }
}
