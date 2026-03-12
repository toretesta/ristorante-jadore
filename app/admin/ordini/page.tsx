'use client';

import { useEffect, useState, useCallback } from 'react';

interface PiattoOrdine {
  id: number;
  ordine_id: number;
  piatto_id: number | null;
  nome: string;
  quantita: number;
  prezzo: number;
}

interface Ordine {
  id: number;
  tipo: string;
  tavolo_id?: number;
  nome_cliente?: string;
  telefono?: string;
  indirizzo?: string;
  piatti: PiattoOrdine[];
  totale: number;
  stato: string;
  created_at: string;
  note: string;
}

const statiOrdine = ['Tutti', 'nuovo', 'in_preparazione', 'pronto', 'servito'];
const statiLabel: Record<string, string> = {
  Tutti: 'Tutti',
  nuovo: 'Nuovo',
  in_preparazione: 'In Preparazione',
  pronto: 'Pronto',
  servito: 'Servito',
};

const prossimoStato: Record<string, string> = {
  nuovo: 'in_preparazione',
  in_preparazione: 'pronto',
  pronto: 'servito',
};

const statoBadgeColori: Record<string, string> = {
  nuovo: 'bg-blue-100 text-blue-800 border-blue-200',
  in_preparazione: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pronto: 'bg-green-100 text-green-800 border-green-200',
  servito: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statoCardBorder: Record<string, string> = {
  nuovo: 'border-l-blue-500',
  in_preparazione: 'border-l-yellow-500',
  pronto: 'border-l-green-500',
  servito: 'border-l-gray-400',
};

export default function OrdiniPage() {
  const [ordini, setOrdini] = useState<Ordine[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [filtroStato, setFiltroStato] = useState('Tutti');
  const [ordineAperto, setOrdineAperto] = useState<number | null>(null);

  const fetchOrdini = useCallback(async () => {
    try {
      const res = await fetch('/api/ordini');
      const data = await res.json();
      setOrdini((data.ordini || []).filter((o: Ordine) => o.tipo === 'tavolo'));
    } catch (error) {
      console.error('Errore nel caricamento degli ordini:', error);
    } finally {
      setCaricamento(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdini();
    const interval = setInterval(fetchOrdini, 10000);
    return () => clearInterval(interval);
  }, [fetchOrdini]);

  const avanzaStato = async (id: number, statoAttuale: string) => {
    const nuovoStato = prossimoStato[statoAttuale];
    if (!nuovoStato) return;
    try {
      const res = await fetch('/api/ordini', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stato: nuovoStato }),
      });
      if (res.ok) fetchOrdini();
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const rimuoviPiatto = async (ordine_id: number, piatto_ordine_id: number) => {
    const res = await fetch('/api/ordini', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove_piatto', ordine_id, piatto_ordine_id }),
    });
    if (res.ok) fetchOrdini();
  };

  const aggiornaQuantita = async (ordine_id: number, piatto_ordine_id: number, quantita: number) => {
    const res = await fetch('/api/ordini', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_quantita', ordine_id, piatto_ordine_id, quantita }),
    });
    if (res.ok) fetchOrdini();
  };

  const eliminaOrdine = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo ordine?')) return;
    const res = await fetch(`/api/ordini?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchOrdini();
  };

  const ordiniFiltrati =
    filtroStato === 'Tutti'
      ? ordini
      : ordini.filter((o) => o.stato === filtroStato);

  const ordinati = [...ordiniFiltrati].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (caricamento) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestione Ordini</h1>
        <p className="text-sm text-gray-500">Aggiornamento automatico ogni 10s</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statiOrdine.map((stato) => (
          <button
            key={stato}
            onClick={() => setFiltroStato(stato)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroStato === stato
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {statiLabel[stato]}
            {stato !== 'Tutti' && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                {ordini.filter((o) => o.stato === stato).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {ordinati.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Nessun ordine trovato.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ordinati.map((ordine) => (
            <div
              key={ordine.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${statoCardBorder[ordine.stato] || 'border-l-gray-300'} overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold text-gray-900">#{ordine.id}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(ordine.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statoBadgeColori[ordine.stato] || 'bg-gray-100 text-gray-800'}`}>
                    {statiLabel[ordine.stato] || ordine.stato}
                  </span>
                </div>

                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700">
                    Tavolo {ordine.tavolo_id}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {ordine.piatti.map((piatto) => (
                    <div key={piatto.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">
                        {piatto.quantita}x {piatto.nome}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">
                          {'\u20AC'}{(Number(piatto.prezzo) * piatto.quantita).toFixed(2)}
                        </span>
                        {ordineAperto === ordine.id && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => aggiornaQuantita(ordine.id, piatto.id, piatto.quantita - 1)}
                              className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-xs hover:bg-gray-300"
                            >
                              -
                            </button>
                            <button
                              onClick={() => aggiornaQuantita(ordine.id, piatto.id, piatto.quantita + 1)}
                              className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-xs hover:bg-gray-300"
                            >
                              +
                            </button>
                            <button
                              onClick={() => rimuoviPiatto(ordine.id, piatto.id)}
                              className="w-5 h-5 flex items-center justify-center bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                            >
                              x
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {ordine.note && (
                  <div className="bg-yellow-50 rounded-lg p-2 mb-3">
                    <p className="text-xs text-yellow-800">
                      <span className="font-medium">Note:</span> {ordine.note}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-lg font-bold text-gray-900">
                    {'\u20AC'}{Number(ordine.totale).toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrdineAperto(ordineAperto === ordine.id ? null : ordine.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        ordineAperto === ordine.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {ordineAperto === ordine.id ? 'Chiudi' : 'Modifica'}
                    </button>
                    {prossimoStato[ordine.stato] && (
                      <button
                        onClick={() => avanzaStato(ordine.id, ordine.stato)}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                      >
                        {'\u2192'} {statiLabel[prossimoStato[ordine.stato]]}
                      </button>
                    )}
                  </div>
                </div>

                {ordineAperto === ordine.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => eliminaOrdine(ordine.id)}
                      className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                    >
                      Elimina Ordine
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
