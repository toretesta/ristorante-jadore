/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();
    const ordini = await sql`SELECT * FROM ordini WHERE tipo = 'delivery' ORDER BY created_at DESC`;

    const ordiniIds = ordini.map((o: any) => o.id);
    let allPiatti: any[] = [];
    if (ordiniIds.length > 0) {
      allPiatti = await sql`SELECT * FROM ordini_piatti WHERE ordine_id = ANY(${ordiniIds})`;
    }

    const ordiniCompleti = ordini.map((o: any) => ({
      ...o,
      piatti: allPiatti.filter((p: any) => p.ordine_id === o.id),
    }));

    return NextResponse.json({ ordini: ordiniCompleti });
  } catch (error) {
    console.error('GET /api/delivery error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { nome_cliente, telefono, indirizzo, piatti, totale, note } = body;

    const ordine = await sql`
      INSERT INTO ordini (tipo, nome_cliente, telefono, indirizzo, totale, stato, note)
      VALUES ('delivery', ${nome_cliente}, ${telefono || ''}, ${indirizzo || ''}, ${totale}, 'nuovo', ${note || ''})
      RETURNING *
    `;

    const ordineId = ordine[0].id;
    for (const piatto of piatti) {
      await sql`
        INSERT INTO ordini_piatti (ordine_id, piatto_id, nome, quantita, prezzo)
        VALUES (${ordineId}, ${piatto.piatto_id || null}, ${piatto.nome}, ${piatto.quantita}, ${piatto.prezzo})
      `;
    }

    const piattiOrdine = await sql`SELECT * FROM ordini_piatti WHERE ordine_id = ${ordineId}`;
    return NextResponse.json({ ordine: { ...ordine[0], piatti: piattiOrdine } });
  } catch (error) {
    console.error('POST /api/delivery error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { id, stato } = body;

    const result = await sql`
      UPDATE ordini SET stato = ${stato} WHERE id = ${id} RETURNING *
    `;

    return NextResponse.json({ ordine: result[0] });
  } catch (error) {
    console.error('PUT /api/delivery error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}
