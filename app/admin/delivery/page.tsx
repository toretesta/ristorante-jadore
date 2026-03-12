'use client';

import { useEffect, useState, useCallback } from 'react';

interface PiattoOrdine {
  id: number;
  nome: string;
  quantita: number;
  prezzo: number;
}

interface OrdineDelivery {
  id: number;
  nome_cliente: string;
  telefono: string;
  indirizzo: string;
  piatti: PiattoOrdine[];
  totale: number;
  stato: string;
  created_at: string;
  note: string;
}

const statiDelivery = ['Tutti', 'nuovo', 'in_preparazione', 'pronto', 'in_consegna', 'consegnato'];

const statiLabel: Record<string, string> = {
  Tutti: 'Tutti',
  nuovo: 'Nuovo',
  in_preparazione: 'In Preparazione',
  pronto: 'Pronto',
  in_consegna: 'In Consegna',
  consegnato: 'Consegnato',
};

const prossimoStato: Record<string, string> = {
  nuovo: 'in_preparazione',
  in_preparazione: 'pronto',
  pronto: 'in_consegna',
  in_consegna: 'consegnato',
};

const statoBadgeColori: Record<string, string> = {
  nuovo: 'bg-blue-100 text-blue-800 border-blue-200',
  in_preparazione: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pronto: 'bg-green-100 text-green-800 border-green-200',
  in_consegna: 'bg-purple-100 text-purple-800 border-purple-200',
  consegnato: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statoCardBorder: Record<string, string> = {
  nuovo: 'border-l-blue-500',
  in_preparazione: 'border-l-yellow-500',
  pronto: 'border-l-green-500',
  in_consegna: 'border-l-purple-500',
  consegnato: 'border-l-gray-400',
};

export default function DeliveryPage() {
  const [ordini, setOrdini] = useState<OrdineDelivery[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [filtroStato, setFiltroStato] = useState('Tutti');

  const fetchOrdini = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery');
      const data = await res.json();
      setOrdini(data.ordini || []);
    } catch (error) {
      console.error('Errore:', error);
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
      const res = await fetch('/api/delivery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stato: nuovoStato }),
      });
      if (res.ok) fetchOrdini();
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const ordiniFiltrati =
    filtroStato === 'Tutti' ? ordini : ordini.filter((o) => o.stato === filtroStato);

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
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Ordini Delivery</h1>
        <p className="text-sm text-gray-500">Aggiornamento automatico ogni 10s</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statiDelivery.map((stato) => (
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
          <p className="text-gray-500">Nessun ordine delivery trovato.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ordinati.map((ordine) => (
            <div key={ordine.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${statoCardBorder[ordine.stato] || 'border-l-gray-300'} overflow-hidden`}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900">#{ordine.id}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statoBadgeColori[ordine.stato] || 'bg-gray-100 text-gray-800'}`}>
                    {statiLabel[ordine.stato] || ordine.stato}
                  </span>
                </div>

                <div className="mb-3 space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{ordine.nome_cliente}</p>
                  <p className="text-sm text-gray-600">{ordine.indirizzo}</p>
                  <p className="text-sm text-gray-500">{ordine.telefono}</p>
                </div>

                <div className="space-y-1 mb-3 bg-gray-50 rounded-lg p-3">
                  {ordine.piatti.map((piatto, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{piatto.quantita}x {piatto.nome}</span>
                      <span className="text-gray-500">{'\u20AC'}{(Number(piatto.prezzo) * piatto.quantita).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {ordine.note && (
                  <div className="bg-yellow-50 rounded-lg p-2 mb-3">
                    <p className="text-xs text-yellow-800"><span className="font-medium">Note:</span> {ordine.note}</p>
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-3">
                  Ordinato alle {new Date(ordine.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-lg font-bold text-gray-900">{'\u20AC'}{Number(ordine.totale).toFixed(2)}</span>
                  {prossimoStato[ordine.stato] && (
                    <button onClick={() => avanzaStato(ordine.id, ordine.stato)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                      {'\u2192'} {statiLabel[prossimoStato[ordine.stato]]}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
