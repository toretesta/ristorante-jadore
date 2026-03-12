/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const soloAttivi = searchParams.get('attivi') === 'true';
    const menuId = searchParams.get('menuId');

    let menus;
    if (soloAttivi) {
      menus = await sql`SELECT * FROM menus WHERE attivo = true ORDER BY ordine, id`;
    } else {
      menus = await sql`SELECT * FROM menus ORDER BY ordine, id`;
    }

    let categorie;
    if (menuId) {
      categorie = await sql`SELECT * FROM categorie WHERE menu_id = ${parseInt(menuId)} ORDER BY ordine, id`;
    } else {
      categorie = await sql`SELECT * FROM categorie ORDER BY ordine, id`;
    }

    const categorieIds = categorie.map((c: any) => c.id);
    let piatti: any[] = [];
    if (categorieIds.length > 0) {
      piatti = await sql`SELECT * FROM piatti WHERE categoria_id = ANY(${categorieIds}) ORDER BY nome`;
    }

    return NextResponse.json({ menus, categorie, piatti });
  } catch (error) {
    console.error('GET /api/menu error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento del menu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { nome, descrizione, prezzo, categoria_id, allergeni, disponibile, immagine } = body;

    const result = await sql`
      INSERT INTO piatti (categoria_id, nome, descrizione, prezzo, allergeni, disponibile, immagine)
      VALUES (${categoria_id}, ${nome}, ${descrizione || ''}, ${prezzo}, ${allergeni || []}, ${disponibile !== false}, ${immagine || ''})
      RETURNING *
    `;

    return NextResponse.json({ piatto: result[0] });
  } catch (error) {
    console.error('POST /api/menu error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiunta del piatto' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { id, nome, descrizione, prezzo, categoria_id, allergeni, disponibile, immagine } = body;

    const result = await sql`
      UPDATE piatti SET
        nome = ${nome},
        descrizione = ${descrizione || ''},
        prezzo = ${prezzo},
        categoria_id = ${categoria_id},
        allergeni = ${allergeni || []},
        disponibile = ${disponibile !== false},
        immagine = ${immagine || ''}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ piatto: result[0] });
  } catch (error) {
    console.error('PUT /api/menu error:', error);
    return NextResponse.json({ error: 'Errore nella modifica del piatto' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 });

    await sql`DELETE FROM piatti WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/menu error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione del piatto' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'toggle_disponibilita': {
        const result = await sql`
          UPDATE piatti SET disponibile = NOT disponibile WHERE id = ${body.id} RETURNING *
        `;
        return NextResponse.json({ piatto: result[0] });
      }

      case 'add_menu': {
        const maxOrdine = await sql`SELECT COALESCE(MAX(ordine), 0) + 1 as next FROM menus`;
        const result = await sql`
          INSERT INTO menus (nome, descrizione, attivo, ordine)
          VALUES (${body.nome}, ${body.descrizione || ''}, ${body.attivo || false}, ${maxOrdine[0].next})
          RETURNING *
        `;
        return NextResponse.json({ menu: result[0] });
      }

      case 'update_menu': {
        const result = await sql`
          UPDATE menus SET nome = ${body.nome}, descrizione = ${body.descrizione || ''}, attivo = ${body.attivo}
          WHERE id = ${body.id} RETURNING *
        `;
        return NextResponse.json({ menu: result[0] });
      }

      case 'toggle_menu': {
        const result = await sql`
          UPDATE menus SET attivo = NOT attivo WHERE id = ${body.id} RETURNING *
        `;
        return NextResponse.json({ menu: result[0] });
      }

      case 'delete_menu': {
        await sql`DELETE FROM menus WHERE id = ${body.id}`;
        return NextResponse.json({ success: true });
      }

      case 'add_categoria': {
        const maxOrdine = await sql`SELECT COALESCE(MAX(ordine), 0) + 1 as next FROM categorie WHERE menu_id = ${body.menu_id}`;
        const result = await sql`
          INSERT INTO categorie (menu_id, nome, ordine)
          VALUES (${body.menu_id}, ${body.nome}, ${maxOrdine[0].next})
          RETURNING *
        `;
        return NextResponse.json({ categoria: result[0] });
      }

      case 'update_categoria': {
        const result = await sql`
          UPDATE categorie SET nome = ${body.nome} WHERE id = ${body.id} RETURNING *
        `;
        return NextResponse.json({ categoria: result[0] });
      }

      case 'delete_categoria': {
        await sql`DELETE FROM categorie WHERE id = ${body.id}`;
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Azione non valida' }, { status: 400 });
    }
  } catch (error) {
    console.error('PATCH /api/menu error:', error);
    return NextResponse.json({ error: 'Errore nell\'operazione' }, { status: 500 });
  }
}
