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
      // Get single tavolo with current session orders
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

export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { id, stato } = body;

    // If changing to "occupato", increment session
    if (stato === 'occupato') {
      const current = await sql`SELECT stato FROM tavoli WHERE id = ${id}`;
      if (current.length > 0 && current[0].stato !== 'occupato') {
        const result = await sql`
          UPDATE tavoli SET stato = ${stato}, sessione_corrente = sessione_corrente + 1
          WHERE id = ${id} RETURNING *
        `;
        return NextResponse.json({ tavolo: result[0] });
      }
    }

    const result = await sql`
      UPDATE tavoli SET stato = ${stato} WHERE id = ${id} RETURNING *
    `;

    return NextResponse.json({ tavolo: result[0] });
  } catch (error) {
    console.error('PUT /api/tavoli error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}
