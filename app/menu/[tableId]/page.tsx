'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Menu {
  id: number;
  nome: string;
  descrizione: string;
  attivo: boolean;
}

interface Piatto {
  id: number;
  categoria_id: number;
  nome: string;
  descrizione: string;
  prezzo: number;
  allergeni: string[];
  disponibile: boolean;
}

interface Categoria {
  id: number;
  menu_id: number;
  nome: string;
  ordine: number;
}

interface CartItem {
  piatto: Piatto;
  quantita: number;
}

type Tab = 'menu' | 'prenota';

export default function MenuPubblico() {
  const params = useParams();
  const tableId = params.tableId as string;

  const [tabAttiva, setTabAttiva] = useState<Tab>('menu');

  // Data
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [piatti, setPiatti] = useState<Piatto[]>([]);
  const [menuAttivo, setMenuAttivo] = useState<number>(0);
  const [categoriaAttiva, setCategoriaAttiva] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [tavoloNumero, setTavoloNumero] = useState<number | null>(null);

  // Cart
  const [carrello, setCarrello] = useState<CartItem[]>([]);
  const [mostraCarrello, setMostraCarrello] = useState(false);
  const [note, setNote] = useState('');
  const [ordinato, setOrdinato] = useState(false);
  const [invio, setInvio] = useState(false);

  // Prenotazione
  const [prenNome, setPrenNome] = useState('');
  const [prenData, setPrenData] = useState('');
  const [prenOra, setPrenOra] = useState('');
  const [prenPersone, setPrenPersone] = useState(2);
  const [prenTelefono, setPrenTelefono] = useState('');
  const [prenNote, setPrenNote] = useState('');
  const [prenInviata, setPrenInviata] = useState(false);
  const [prenInvio, setPrenInvio] = useState(false);

  useEffect(() => {
    setPrenData(new Date().toISOString().split('T')[0]);

    const loadData = async () => {
      try {
        const [menuRes, tavoliRes] = await Promise.all([
          fetch('/api/menu?attivi=true'),
          fetch('/api/tavoli'),
        ]);
        const menuData = await menuRes.json();
        const tavoliData = await tavoliRes.json();

        const activeMenus = menuData.menus || [];
        setMenus(activeMenus);
        setCategorie(menuData.categorie || []);
        setPiatti((menuData.piatti || []).filter((p: Piatto) => p.disponibile));

        if (activeMenus.length > 0) {
          setMenuAttivo(activeMenus[0].id);
        }

        // Find tavolo number from tableId
        const tavolo = (tavoliData.tavoli || []).find((t: { id: number; numero: number }) => String(t.id) === tableId);
        if (tavolo) setTavoloNumero(tavolo.numero);
      } catch (error) {
        console.error('Errore nel caricamento:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tableId]);

  // When menu changes, select first category
  useEffect(() => {
    const cats = categorie.filter(c => c.menu_id === menuAttivo);
    if (cats.length > 0) {
      setCategoriaAttiva(cats[0].id);
    } else {
      setCategoriaAttiva(0);
    }
  }, [menuAttivo, categorie]);

  const nomeTabella = tavoloNumero ? `Tavolo ${tavoloNumero}` : `Tavolo #${tableId}`;
  const categorieMenu = categorie.filter(c => c.menu_id === menuAttivo);
  const piattiFiltrati = piatti.filter(p => p.categoria_id === categoriaAttiva);

  // Cart functions
  const aggiungiAlCarrello = (piatto: Piatto) => {
    setCarrello(prev => {
      const existing = prev.find(item => item.piatto.id === piatto.id);
      if (existing) {
        return prev.map(item =>
          item.piatto.id === piatto.id ? { ...item, quantita: item.quantita + 1 } : item
        );
      }
      return [...prev, { piatto, quantita: 1 }];
    });
  };

  const rimuoviDalCarrello = (piattoId: number) => {
    setCarrello(prev => {
      const existing = prev.find(item => item.piatto.id === piattoId);
      if (existing && existing.quantita > 1) {
        return prev.map(item =>
          item.piatto.id === piattoId ? { ...item, quantita: item.quantita - 1 } : item
        );
      }
      return prev.filter(item => item.piatto.id !== piattoId);
    });
  };

  const totaleCarrello = carrello.reduce((sum, item) => sum + Number(item.piatto.prezzo) * item.quantita, 0);
  const totaleArticoli = carrello.reduce((sum, item) => sum + item.quantita, 0);

  const inviaOrdine = async () => {
    if (carrello.length === 0) return;
    setInvio(true);
    try {
      const ordine = {
        tipo: 'tavolo',
        tavolo_id: parseInt(tableId),
        piatti: carrello.map(item => ({
          piatto_id: item.piatto.id,
          nome: item.piatto.nome,
          quantita: item.quantita,
          prezzo: Number(item.piatto.prezzo),
        })),
        totale: totaleCarrello,
        note,
      };
      const res = await fetch('/api/ordini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ordine),
      });
      if (res.ok) {
        setOrdinato(true);
        setCarrello([]);
        setNote('');
        setMostraCarrello(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInvio(false);
    }
  };

  const inviaPrenotazione = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrenInvio(true);
    try {
      const res = await fetch('/api/prenotazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: prenNome,
          data: prenData,
          ora: prenOra,
          persone: prenPersone,
          tavolo_id: null,
          telefono: prenTelefono,
          note: prenNote,
          stato: 'in_attesa',
        }),
      });
      if (res.ok) {
        setPrenInviata(true);
        setPrenNome('');
        setPrenOra('');
        setPrenPersone(2);
        setPrenTelefono('');
        setPrenNote('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPrenInvio(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">{'🍽️'}</div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (ordinato) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <div className="text-6xl mb-4">{'✅'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ordine Inviato!</h2>
          <p className="text-gray-600 mb-2">Il tuo ordine e stato ricevuto dalla cucina.</p>
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 mb-6">
            Un cameriere passera al {nomeTabella} per confermare l&apos;ordine.
          </p>
          <button onClick={() => setOrdinato(false)}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
            Torna al Menu
          </button>
        </div>
      </div>
    );
  }

  if (prenInviata) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <div className="text-6xl mb-4">{'📅'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Prenotazione Inviata!</h2>
          <p className="text-gray-600 mb-2">La tua richiesta di prenotazione e stata ricevuta.</p>
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 mb-6">
            Un membro del personale confermera la tua prenotazione a breve.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setPrenInviata(false); setTabAttiva('menu'); }}
              className="flex-1 bg-amber-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
              Vedi Menu
            </button>
            <button onClick={() => setPrenInviata(false)}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
              Nuova Prenotazione
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white py-6 px-4 shadow-lg">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold">{'\u{1F35D}'} J&apos;adore Ristorante</h1>
          <p className="text-amber-200 mt-1">{nomeTabella}</p>
        </div>
      </div>

      {/* Main tabs */}
      <div className="sticky top-0 z-20 bg-white shadow-md">
        <div className="max-w-lg mx-auto flex">
          <button onClick={() => setTabAttiva('menu')}
            className={`flex-1 py-3 text-center font-semibold text-sm border-b-2 transition ${
              tabAttiva === 'menu' ? 'border-amber-600 text-amber-700 bg-amber-50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {'📖'} Menu & Ordina
          </button>
          <button onClick={() => setTabAttiva('prenota')}
            className={`flex-1 py-3 text-center font-semibold text-sm border-b-2 transition ${
              tabAttiva === 'prenota' ? 'border-amber-600 text-amber-700 bg-amber-50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {'📅'} Prenota Tavolo
          </button>
        </div>
      </div>

      {/* ===== TAB MENU ===== */}
      {tabAttiva === 'menu' && (
        <>
          {/* Menu selector (if multiple menus) */}
          {menus.length > 1 && (
            <div className="bg-white border-b">
              <div className="max-w-lg mx-auto overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                <div className="flex gap-2 px-4 py-2 w-max min-w-full">
                  {menus.map(menu => (
                    <button key={menu.id} onClick={() => setMenuAttivo(menu.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                        menuAttivo === menu.id
                          ? 'bg-amber-700 text-white'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}>
                      {menu.nome}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category tabs */}
          <div className="sticky top-[49px] bg-white shadow-sm z-10">
            <div className="max-w-lg mx-auto overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              <div className="flex gap-2 px-4 py-2 w-max min-w-full">
                {categorieMenu.map(cat => (
                  <button key={cat.id} onClick={() => setCategoriaAttiva(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                      categoriaAttiva === cat.id ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {cat.nome}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="max-w-lg mx-auto p-4 space-y-3">
            {piattiFiltrati.map(piatto => {
              const inCarrello = carrello.find(item => item.piatto.id === piatto.id);
              return (
                <div key={piatto.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-3">
                      <h3 className="font-semibold text-gray-800">{piatto.nome}</h3>
                      <p className="text-sm text-gray-500 mt-1">{piatto.descrizione}</p>
                      {piatto.allergeni && piatto.allergeni.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {piatto.allergeni.map(a => (
                            <span key={a} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-lg font-bold text-amber-700">&euro;{Number(piatto.prezzo).toFixed(2)}</span>
                      {inCarrello ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => rimuoviDalCarrello(piatto.id)}
                            className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-300">-</button>
                          <span className="font-semibold text-gray-800 w-5 text-center">{inCarrello.quantita}</span>
                          <button onClick={() => aggiungiAlCarrello(piatto)}
                            className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center hover:bg-amber-700">+</button>
                        </div>
                      ) : (
                        <button onClick={() => aggiungiAlCarrello(piatto)}
                          className="bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-amber-700 transition">
                          Aggiungi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {piattiFiltrati.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nessun piatto disponibile in questa categoria</p>
            )}
          </div>

          {/* Cart floating button */}
          {carrello.length > 0 && !mostraCarrello && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-20">
              <div className="max-w-lg mx-auto">
                <button onClick={() => setMostraCarrello(true)}
                  className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold flex items-center justify-between px-6 hover:bg-amber-700 transition">
                  <span>{'🛒'} Vedi Carrello ({totaleArticoli})</span>
                  <span>&euro;{totaleCarrello.toFixed(2)}</span>
                </button>
              </div>
            </div>
          )}

          {/* Cart overlay */}
          {mostraCarrello && (
            <div className="fixed inset-0 bg-black/50 z-30 flex items-end">
              <div className="bg-white w-full max-h-[80vh] rounded-t-2xl overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">{'🛒'} Il tuo Ordine</h2>
                  <button onClick={() => setMostraCarrello(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">{'✕'}</button>
                </div>
                <div className="p-4 space-y-3">
                  {carrello.map(item => (
                    <div key={item.piatto.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.piatto.nome}</p>
                        <p className="text-sm text-gray-500">&euro;{Number(item.piatto.prezzo).toFixed(2)} cad.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => rimuoviDalCarrello(item.piatto.id)}
                          className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm">-</button>
                        <span className="font-semibold w-5 text-center">{item.quantita}</span>
                        <button onClick={() => aggiungiAlCarrello(item.piatto)}
                          className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm">+</button>
                      </div>
                      <span className="ml-4 font-semibold text-gray-800 w-16 text-right">
                        &euro;{(Number(item.piatto.prezzo) * item.quantita).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note per la cucina</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)}
                      className="w-full border rounded-lg p-2 text-sm" rows={2}
                      placeholder="Es. senza cipolla, cottura al sangue..." />
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                    {'ℹ️'} Un cameriere passera al tavolo per confermare l&apos;ordine.
                  </div>
                  <div className="flex justify-between items-center py-3 border-t text-lg font-bold">
                    <span>Totale</span>
                    <span className="text-amber-700">&euro;{totaleCarrello.toFixed(2)}</span>
                  </div>
                  <button onClick={inviaOrdine} disabled={invio}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50">
                    {invio ? 'Invio in corso...' : 'Invia Ordine'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== TAB PRENOTA ===== */}
      {tabAttiva === 'prenota' && (
        <div className="max-w-lg mx-auto p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Prenota un Tavolo</h2>
            <p className="text-sm text-gray-500 mb-6">Compila il form e il personale confermera la tua prenotazione.</p>
            <form onSubmit={inviaPrenotazione} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input type="text" value={prenNome} onChange={(e) => setPrenNome(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="Il tuo nome" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                <input type="tel" value={prenTelefono} onChange={(e) => setPrenTelefono(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="333-1234567" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                  <input type="date" value={prenData} onChange={(e) => setPrenData(e.target.value)} required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ora *</label>
                  <input type="time" value={prenOra} onChange={(e) => setPrenOra(e.target.value)} required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero di persone *</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setPrenPersone(Math.max(1, prenPersone - 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-300">-</button>
                  <span className="text-xl font-bold text-gray-800 w-8 text-center">{prenPersone}</span>
                  <button type="button" onClick={() => setPrenPersone(Math.min(20, prenPersone + 1))}
                    className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center hover:bg-amber-700">+</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea value={prenNote} onChange={(e) => setPrenNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  rows={3} placeholder="Es. allergie, occasione speciale, seggiolone..." />
              </div>
              <button type="submit" disabled={prenInvio}
                className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition disabled:opacity-50">
                {prenInvio ? 'Invio in corso...' : 'Invia Prenotazione'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
