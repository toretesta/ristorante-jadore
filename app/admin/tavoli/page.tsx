/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';

interface PiattoOrdine {
  id: number;
  ordine_id: number;
  nome: string;
  quantita: number;
  prezzo: number;
}

interface Ordine {
  id: number;
  stato: string;
  totale: number;
  created_at: string;
  note: string;
  piatti: PiattoOrdine[];
}

interface Tavolo {
  id: number;
  numero: number;
  posti: number;
  stato: string;
  sessione_corrente: number;
}

const statoColori: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  libero: { bg: 'bg-green-50', border: 'border-green-300', dot: 'bg-green-500', text: 'text-green-800' },
  occupato: { bg: 'bg-red-50', border: 'border-red-300', dot: 'bg-red-500', text: 'text-red-800' },
  riservato: { bg: 'bg-yellow-50', border: 'border-yellow-300', dot: 'bg-yellow-500', text: 'text-yellow-800' },
};

const statoLabel: Record<string, string> = {
  libero: 'Libero',
  occupato: 'Occupato',
  riservato: 'Riservato',
};

const statiOrdine: Record<string, string> = {
  nuovo: 'Nuovo',
  in_preparazione: 'In Prep.',
  pronto: 'Pronto',
  servito: 'Servito',
};

const statoBadge: Record<string, string> = {
  nuovo: 'bg-blue-100 text-blue-800',
  in_preparazione: 'bg-yellow-100 text-yellow-800',
  pronto: 'bg-green-100 text-green-800',
  servito: 'bg-gray-100 text-gray-800',
};

export default function TavoliPage() {
  const [tavoli, setTavoli] = useState<Tavolo[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [qrTavolo, setQrTavolo] = useState<number | null>(null);
  const [tavoloAperto, setTavoloAperto] = useState<number | null>(null);
  const [ordiniTavolo, setOrdiniTavolo] = useState<Ordine[]>([]);
  const [caricamentoOrdini, setCaricamentoOrdini] = useState(false);

  // Form nuovo tavolo
  const [mostraForm, setMostraForm] = useState(false);
  const [formNumero, setFormNumero] = useState('');
  const [formPosti, setFormPosti] = useState('4');

  // Form modifica tavolo
  const [editTavolo, setEditTavolo] = useState<number | null>(null);
  const [editNumero, setEditNumero] = useState('');
  const [editPosti, setEditPosti] = useState('');

  const fetchTavoli = useCallback(async () => {
    try {
      const res = await fetch('/api/tavoli');
      const data = await res.json();
      setTavoli(data.tavoli || []);
    } catch (error) {
      console.error('Errore nel caricamento dei tavoli:', error);
    } finally {
      setCaricamento(false);
    }
  }, []);

  useEffect(() => {
    fetchTavoli();
  }, [fetchTavoli]);

  const fetchOrdiniTavolo = async (tavoloId: number) => {
    setCaricamentoOrdini(true);
    try {
      const res = await fetch(`/api/tavoli?id=${tavoloId}`);
      const data = await res.json();
      setOrdiniTavolo(data.ordini || []);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setCaricamentoOrdini(false);
    }
  };

  const toggleTavoloAperto = (id: number) => {
    if (tavoloAperto === id) {
      setTavoloAperto(null);
      setOrdiniTavolo([]);
    } else {
      setTavoloAperto(id);
      fetchOrdiniTavolo(id);
    }
  };

  // CRUD Tavoli
  const aggiungiTavolo = async () => {
    if (!formNumero) return;
    try {
      const res = await fetch('/api/tavoli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: parseInt(formNumero), posti: parseInt(formPosti) || 4 }),
      });
      if (res.ok) {
        setFormNumero('');
        setFormPosti('4');
        setMostraForm(false);
        fetchTavoli();
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const eliminaTavolo = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo tavolo? Tutti gli ordini associati rimarranno nel sistema.')) return;
    try {
      const res = await fetch(`/api/tavoli?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (tavoloAperto === id) { setTavoloAperto(null); setOrdiniTavolo([]); }
        fetchTavoli();
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const iniziaModifica = (tavolo: Tavolo) => {
    setEditTavolo(tavolo.id);
    setEditNumero(String(tavolo.numero));
    setEditPosti(String(tavolo.posti));
  };

  const salvaModifica = async () => {
    if (!editTavolo || !editNumero) return;
    try {
      const res = await fetch('/api/tavoli', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editTavolo, numero: parseInt(editNumero), posti: parseInt(editPosti) || 4 }),
      });
      if (res.ok) {
        setEditTavolo(null);
        fetchTavoli();
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const cambiaStato = async (id: number, nuovoStato: string) => {
    try {
      const res = await fetch('/api/tavoli', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stato: nuovoStato }),
      });
      const data = await res.json();
      if (res.ok) {
        setTavoli(prev => prev.map(t => t.id === id ? data.tavolo : t));
        if (tavoloAperto === id) fetchOrdiniTavolo(id);
      } else {
        alert('Errore: ' + (data.error || 'Impossibile aggiornare lo stato'));
      }
    } catch (error) {
      console.error('Errore nel cambio di stato:', error);
      alert('Errore di connessione');
    }
  };

  const nuovaSessione = async (id: number) => {
    if (!confirm('Vuoi iniziare una nuova sessione per questo tavolo? Gli ordini precedenti non saranno piu visibili nella sessione corrente.')) return;
    try {
      const res = await fetch('/api/tavoli', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'nuova_sessione' }),
      });
      const data = await res.json();
      if (res.ok) {
        setTavoli(prev => prev.map(t => t.id === id ? data.tavolo : t));
        if (tavoloAperto === id) fetchOrdiniTavolo(id);
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const cambiaStatoOrdine = async (ordineId: number, nuovoStato: string) => {
    try {
      const res = await fetch('/api/ordini', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ordineId, stato: nuovoStato }),
      });
      if (res.ok && tavoloAperto) fetchOrdiniTavolo(tavoloAperto);
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const aggiornaQuantita = async (ordineId: number, piattoOrdineId: number, quantita: number) => {
    const res = await fetch('/api/ordini', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_quantita', ordine_id: ordineId, piatto_ordine_id: piattoOrdineId, quantita }),
    });
    if (res.ok && tavoloAperto) fetchOrdiniTavolo(tavoloAperto);
  };

  const rimuoviPiatto = async (ordineId: number, piattoOrdineId: number) => {
    const res = await fetch('/api/ordini', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove_piatto', ordine_id: ordineId, piatto_ordine_id: piattoOrdineId }),
    });
    if (res.ok && tavoloAperto) fetchOrdiniTavolo(tavoloAperto);
  };

  const eliminaOrdine = async (ordineId: number) => {
    if (!confirm('Eliminare questo ordine?')) return;
    const res = await fetch(`/api/ordini?id=${ordineId}`, { method: 'DELETE' });
    if (res.ok && tavoloAperto) fetchOrdiniTavolo(tavoloAperto);
  };

  const getQrUrl = (tavolo: Tavolo) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/menu/${tavolo.id}`;
  };

  const getQrImageUrl = (tavolo: Tavolo) => {
    const menuUrl = getQrUrl(tavolo);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`;
  };

  const stampaQr = (tavolo: Tavolo) => {
    const qrImg = getQrImageUrl(tavolo);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>QR Tavolo ${tavolo.numero}</title></head>
          <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
            <h1 style="margin-bottom:10px;">Tavolo ${tavolo.numero}</h1>
            <p style="margin-bottom:20px;color:#666;">Scansiona per vedere il menu</p>
            <img src="${qrImg}" alt="QR Code" style="width:250px;height:250px;" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const countPerStato = (stato: string) => tavoli.filter((t) => t.stato === stato).length;

  if (caricamento) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestione Tavoli</h1>
        <button
          onClick={() => setMostraForm(!mostraForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {mostraForm ? 'Annulla' : '+ Aggiungi Tavolo'}
        </button>
      </div>

      {/* Form nuovo tavolo */}
      {mostraForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Nuovo Tavolo</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Numero tavolo</label>
              <input
                type="number"
                value={formNumero}
                onChange={(e) => setFormNumero(e.target.value)}
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Es. 1"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Posti</label>
              <input
                type="number"
                value={formPosti}
                onChange={(e) => setFormPosti(e.target.value)}
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Es. 4"
                min="1"
              />
            </div>
            <button
              onClick={aggiungiTavolo}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Crea Tavolo
            </button>
          </div>
        </div>
      )}

      {/* Riepilogo stati */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-700">Liberi: {countPerStato('libero')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-gray-700">Occupati: {countPerStato('occupato')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="text-gray-700">Riservati: {countPerStato('riservato')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Totale: {tavoli.length}</span>
        </div>
      </div>

      {/* Griglia tavoli */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tavoli.map((tavolo) => {
          const colori = statoColori[tavolo.stato] || statoColori.libero;
          const isAperto = tavoloAperto === tavolo.id;
          const isEditing = editTavolo === tavolo.id;
          return (
            <div
              key={tavolo.id}
              className={`rounded-xl border-2 ${colori.border} ${colori.bg} p-5 transition-all ${isAperto ? 'sm:col-span-2 lg:col-span-2' : ''}`}
            >
              {/* Header */}
              {isEditing ? (
                <div className="mb-4 space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-0.5">N.</label>
                      <input type="number" value={editNumero} onChange={(e) => setEditNumero(e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm" min="1" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-0.5">Posti</label>
                      <input type="number" value={editPosti} onChange={(e) => setEditPosti(e.target.value)}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm" min="1" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={salvaModifica}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                      Salva
                    </button>
                    <button onClick={() => setEditTavolo(null)}
                      className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300">
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">Tavolo {tavolo.numero}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${colori.dot}`}></span>
                      <span className={`text-sm font-medium ${colori.text}`}>
                        {statoLabel[tavolo.stato] || tavolo.stato}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">{tavolo.posti} posti</p>
                    <div className="flex gap-1">
                      <button onClick={() => iniziaModifica(tavolo)}
                        className="px-2 py-1 bg-white/70 text-gray-600 rounded text-xs hover:bg-white transition-colors">
                        Modifica
                      </button>
                      <button onClick={() => eliminaTavolo(tavolo.id)}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors">
                        Elimina
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Bottoni stato */}
              <div className="flex gap-2 mb-3">
                {tavolo.stato !== 'libero' && (
                  <button onClick={() => cambiaStato(tavolo.id, 'libero')}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                    Libera
                  </button>
                )}
                {tavolo.stato !== 'occupato' && (
                  <button onClick={() => cambiaStato(tavolo.id, 'occupato')}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors">
                    Occupa
                  </button>
                )}
                {tavolo.stato !== 'riservato' && (
                  <button onClick={() => cambiaStato(tavolo.id, 'riservato')}
                    className="flex-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600 transition-colors">
                    Riserva
                  </button>
                )}
              </div>

              {/* Nuova Sessione */}
              {tavolo.stato === 'occupato' && (
                <button onClick={() => nuovaSessione(tavolo.id)}
                  className="w-full mb-3 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors">
                  Nuova Sessione (nuovo gruppo)
                </button>
              )}

              {/* Bottoni QR + Ordini */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleTavoloAperto(tavolo.id)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isAperto ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  {isAperto ? 'Chiudi Ordini' : 'Vedi Ordini'}
                </button>
                <button
                  onClick={() => setQrTavolo(qrTavolo === tavolo.id ? null : tavolo.id)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
                >
                  QR
                </button>
                <button
                  onClick={() => stampaQr(tavolo)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
                >
                  Stampa
                </button>
              </div>

              {/* QR Code display */}
              {qrTavolo === tavolo.id && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 text-center">
                  <img
                    src={getQrImageUrl(tavolo)}
                    alt={`QR Code Tavolo ${tavolo.numero}`}
                    className="mx-auto mb-2"
                    width={160}
                    height={160}
                  />
                  <p className="text-xs text-gray-500 break-all">{getQrUrl(tavolo)}</p>
                </div>
              )}

              {/* Ordini sessione corrente */}
              {isAperto && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">
                    Ordini sessione corrente
                    <span className="ml-1 text-xs font-normal text-gray-400">(#{tavolo.sessione_corrente})</span>
                  </h4>
                  {caricamentoOrdini ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : ordiniTavolo.length === 0 ? (
                    <p className="text-xs text-gray-500 py-2">Nessun ordine per questa sessione.</p>
                  ) : (
                    <div className="space-y-3">
                      {ordiniTavolo.map((ordine) => (
                        <div key={ordine.id} className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-700">#{ordine.id}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(ordine.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statoBadge[ordine.stato] || 'bg-gray-100'}`}>
                              {statiOrdine[ordine.stato] || ordine.stato}
                            </span>
                          </div>

                          {/* Piatti con modifica */}
                          <div className="space-y-1 mb-2">
                            {ordine.piatti.map((piatto) => (
                              <div key={piatto.id} className="flex items-center justify-between text-xs">
                                <span className="text-gray-700 flex-1">
                                  {piatto.quantita}x {piatto.nome}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500 mr-1">
                                    {'\u20AC'}{(Number(piatto.prezzo) * piatto.quantita).toFixed(2)}
                                  </span>
                                  <button
                                    onClick={() => aggiornaQuantita(ordine.id, piatto.id, piatto.quantita - 1)}
                                    className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-xs hover:bg-gray-200"
                                  >-</button>
                                  <button
                                    onClick={() => aggiornaQuantita(ordine.id, piatto.id, piatto.quantita + 1)}
                                    className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-xs hover:bg-gray-200"
                                  >+</button>
                                  <button
                                    onClick={() => rimuoviPiatto(ordine.id, piatto.id)}
                                    className="w-5 h-5 flex items-center justify-center bg-red-50 text-red-600 rounded text-xs hover:bg-red-100"
                                  >x</button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {ordine.note && (
                            <p className="text-xs text-yellow-700 bg-yellow-50 rounded p-1.5 mb-2">Note: {ordine.note}</p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-sm font-bold">{'\u20AC'}{Number(ordine.totale).toFixed(2)}</span>
                            <div className="flex gap-1">
                              {Object.entries(statiOrdine).map(([key, label]) => (
                                <button
                                  key={key}
                                  onClick={() => ordine.stato !== key && cambiaStatoOrdine(ordine.id, key)}
                                  disabled={ordine.stato === key}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                    ordine.stato === key
                                      ? (statoBadge[key] || 'bg-gray-200') + ' cursor-default'
                                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 cursor-pointer'
                                  }`}
                                >{label}</button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => eliminaOrdine(ordine.id)}
                            className="w-full mt-2 px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 transition-colors"
                          >
                            Elimina Ordine
                          </button>
                        </div>
                      ))}

                      {/* Totale sessione */}
                      <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                        <span className="text-sm font-bold text-gray-700">
                          Totale Tavolo: {'\u20AC'}{ordiniTavolo.reduce((sum, o) => sum + Number(o.totale), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tavoli.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Nessun tavolo configurato. Clicca &quot;Aggiungi Tavolo&quot; per iniziare.</p>
        </div>
      )}
    </div>
  );
}
