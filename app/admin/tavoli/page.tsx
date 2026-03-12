'use client';

import { useEffect, useState } from 'react';

interface Tavolo {
  id: number;
  numero: number;
  posti: number;
  stato: string;
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

export default function TavoliPage() {
  const [tavoli, setTavoli] = useState<Tavolo[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [qrTavolo, setQrTavolo] = useState<number | null>(null);

  const fetchTavoli = async () => {
    try {
      const res = await fetch('/api/tavoli');
      const data = await res.json();
      setTavoli(data.tavoli || []);
    } catch (error) {
      console.error('Errore nel caricamento dei tavoli:', error);
    } finally {
      setCaricamento(false);
    }
  };

  useEffect(() => {
    fetchTavoli();
  }, []);

  const cambiaStato = async (id: number, nuovoStato: string) => {
    try {
      const res = await fetch('/api/tavoli', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stato: nuovoStato }),
      });
      const data = await res.json();
      if (res.ok) {
        setTavoli(prev => prev.map(t => t.id === id ? { ...t, stato: nuovoStato } : t));
      } else {
        alert('Errore: ' + (data.error || 'Impossibile aggiornare lo stato'));
      }
    } catch (error) {
      console.error('Errore nel cambio di stato:', error);
      alert('Errore di connessione nel cambio di stato');
    }
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
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestione Tavoli</h1>
      </div>

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
      </div>

      {/* Griglia tavoli */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tavoli.map((tavolo) => {
          const colori = statoColori[tavolo.stato] || statoColori.libero;
          return (
            <div
              key={tavolo.id}
              className={`rounded-xl border-2 ${colori.border} ${colori.bg} p-5 transition-all`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Tavolo {tavolo.numero}</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${colori.dot}`}></span>
                  <span className={`text-sm font-medium ${colori.text}`}>
                    {statoLabel[tavolo.stato] || tavolo.stato}
                  </span>
                </div>
              </div>

              {/* Info */}
              <p className="text-sm text-gray-600 mb-4">{tavolo.posti} posti</p>

              {/* Bottoni stato */}
              <div className="flex gap-2 mb-3">
                {tavolo.stato !== 'libero' && (
                  <button
                    onClick={() => cambiaStato(tavolo.id, 'libero')}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                  >
                    Libera
                  </button>
                )}
                {tavolo.stato !== 'occupato' && (
                  <button
                    onClick={() => cambiaStato(tavolo.id, 'occupato')}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                  >
                    Occupa
                  </button>
                )}
                {tavolo.stato !== 'riservato' && (
                  <button
                    onClick={() => cambiaStato(tavolo.id, 'riservato')}
                    className="flex-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600 transition-colors"
                  >
                    Riserva
                  </button>
                )}
              </div>

              {/* QR Code */}
              <div className="flex gap-2">
                <button
                  onClick={() => setQrTavolo(qrTavolo === tavolo.id ? null : tavolo.id)}
                  className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
                >
                  {qrTavolo === tavolo.id ? 'Nascondi QR' : 'Mostra QR'}
                </button>
                <button
                  onClick={() => stampaQr(tavolo)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                >
                  Stampa QR
                </button>
              </div>

              {/* QR Code display */}
              {qrTavolo === tavolo.id && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 text-center">
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
            </div>
          );
        })}
      </div>

      {tavoli.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Nessun tavolo configurato.</p>
        </div>
      )}
    </div>
  );
}
