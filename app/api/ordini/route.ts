/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const stato = searchParams.get('stato');

    let ordini;
    if (stato) {
      ordini = await sql`SELECT * FROM ordini WHERE stato = ${stato} ORDER BY created_at DESC`;
    } else {
      ordini = await sql`SELECT * FROM ordini ORDER BY created_at DESC`;
    }

    // Fetch piatti for each order
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
    console.error('GET /api/ordini error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento degli ordini' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { tipo, tavolo_id, nome_cliente, telefono, indirizzo, piatti, totale, note } = body;

    // Get current session for the table
    let sessioneTavolo = null;
    if (tavolo_id) {
      const tavolo = await sql`SELECT sessione_corrente FROM tavoli WHERE id = ${tavolo_id}`;
      if (tavolo.length > 0) {
        sessioneTavolo = tavolo[0].sessione_corrente;
      }
    }

    const ordine = await sql`
      INSERT INTO ordini (tipo, tavolo_id, nome_cliente, telefono, indirizzo, totale, stato, note, sessione_tavolo)
      VALUES (${tipo || 'tavolo'}, ${tavolo_id || null}, ${nome_cliente || ''}, ${telefono || ''}, ${indirizzo || ''}, ${totale}, 'nuovo', ${note || ''}, ${sessioneTavolo})
      RETURNING *
    `;

    const ordineId = ordine[0].id;

    // Insert order items
    for (const piatto of piatti) {
      await sql`
        INSERT INTO ordini_piatti (ordine_id, piatto_id, nome, quantita, prezzo)
        VALUES (${ordineId}, ${piatto.piatto_id || null}, ${piatto.nome}, ${piatto.quantita}, ${piatto.prezzo})
      `;
    }

    // Fetch complete order
    const piattiOrdine = await sql`SELECT * FROM ordini_piatti WHERE ordine_id = ${ordineId}`;

    return NextResponse.json({ ordine: { ...ordine[0], piatti: piattiOrdine } });
  } catch (error) {
    console.error('POST /api/ordini error:', error);
    return NextResponse.json({ error: 'Errore nella creazione dell\'ordine' }, { status: 500 });
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
    console.error('PUT /api/ordini error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento dell\'ordine' }, { status: 500 });
  }
}

// PATCH - Modify order items (add/remove/update items in an order)
export async function PATCH(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'add_piatto': {
        const { ordine_id, piatto_id, nome, quantita, prezzo } = body;
        await sql`
          INSERT INTO ordini_piatti (ordine_id, piatto_id, nome, quantita, prezzo)
          VALUES (${ordine_id}, ${piatto_id || null}, ${nome}, ${quantita}, ${prezzo})
        `;
        // Recalculate total
        const items = await sql`SELECT quantita, prezzo FROM ordini_piatti WHERE ordine_id = ${ordine_id}`;
        const nuovoTotale = items.reduce((sum: number, i: any) => sum + (i.quantita * i.prezzo), 0);
        await sql`UPDATE ordini SET totale = ${nuovoTotale} WHERE id = ${ordine_id}`;
        return NextResponse.json({ success: true });
      }

      case 'remove_piatto': {
        const { ordine_id: oid, piatto_ordine_id } = body;
        await sql`DELETE FROM ordini_piatti WHERE id = ${piatto_ordine_id}`;
        const items = await sql`SELECT quantita, prezzo FROM ordini_piatti WHERE ordine_id = ${oid}`;
        const nuovoTotale = items.reduce((sum: number, i: any) => sum + (i.quantita * i.prezzo), 0);
        await sql`UPDATE ordini SET totale = ${nuovoTotale} WHERE id = ${oid}`;
        return NextResponse.json({ success: true });
      }

      case 'update_quantita': {
        const { ordine_id: ordId, piatto_ordine_id: poId, quantita: qty } = body;
        if (qty <= 0) {
          await sql`DELETE FROM ordini_piatti WHERE id = ${poId}`;
        } else {
          await sql`UPDATE ordini_piatti SET quantita = ${qty} WHERE id = ${poId}`;
        }
        const items = await sql`SELECT quantita, prezzo FROM ordini_piatti WHERE ordine_id = ${ordId}`;
        const nuovoTotale = items.reduce((sum: number, i: any) => sum + (i.quantita * i.prezzo), 0);
        await sql`UPDATE ordini SET totale = ${nuovoTotale} WHERE id = ${ordId}`;
        return NextResponse.json({ success: true });
      }

      case 'update_note': {
        await sql`UPDATE ordini SET note = ${body.note} WHERE id = ${body.ordine_id}`;
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Azione non valida' }, { status: 400 });
    }
  } catch (error) {
    console.error('PATCH /api/ordini error:', error);
    return NextResponse.json({ error: 'Errore nella modifica dell\'ordine' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 });

    await sql`DELETE FROM ordini WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/ordini error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione dell\'ordine' }, { status: 500 });
  }
}
