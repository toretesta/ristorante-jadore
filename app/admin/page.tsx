'use client';

import { useEffect, useState } from 'react';

interface Ordine {
  id: number;
  tipo: string;
  tavolo_id?: number;
  totale: number;
  stato: string;
  created_at: string;
  note: string;
  piatti: { nome: string; quantita: number }[];
}

interface Prenotazione {
  id: number;
  nome: string;
  data: string;
  ora: string;
  persone: number;
  tavolo_id: number;
  telefono: string;
  note: string;
  stato: string;
}

interface Ingrediente {
  id: number;
  nome: string;
  quantita: number;
  unita: string;
  minimo_scorta: number;
}

export default function DashboardPage() {
  const [ordini, setOrdini] = useState<Ordine[]>([]);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [ingredienti, setIngredienti] = useState<Ingrediente[]>([]);
  const [caricamento, setCaricamento] = useState(true);

  const oggi = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordiniRes, prenotazioniRes, magazzinoRes] = await Promise.all([
          fetch('/api/ordini'),
          fetch('/api/prenotazioni'),
          fetch('/api/magazzino'),
        ]);

        const ordiniData = await ordiniRes.json();
        const prenotazioniData = await prenotazioniRes.json();
        const magazzinoData = await magazzinoRes.json();

        setOrdini(ordiniData.ordini || []);
        setPrenotazioni(prenotazioniData.prenotazioni || []);
        setIngredienti(magazzinoData.ingredienti || []);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      } finally {
        setCaricamento(false);
      }
    };
    fetchData();
  }, []);

  const ordiniAttivi = ordini.filter(
    (o) => o.stato !== 'servito' && o.stato !== 'consegnato'
  );
  const prenotazioniOggi = prenotazioni.filter((p) => {
    const dataStr = typeof p.data === 'string' ? p.data.split('T')[0] : '';
    return dataStr === oggi;
  });
  const scorteBasse = ingredienti.filter(
    (i) => Number(i.quantita) <= Number(i.minimo_scorta)
  );
  const ordiniRecenti = [...ordini]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const statoBadge = (stato: string) => {
    const colori: Record<string, string> = {
      nuovo: 'bg-blue-100 text-blue-800',
      in_preparazione: 'bg-yellow-100 text-yellow-800',
      pronto: 'bg-green-100 text-green-800',
      servito: 'bg-gray-100 text-gray-800',
      in_consegna: 'bg-purple-100 text-purple-800',
      consegnato: 'bg-gray-100 text-gray-800',
    };
    const etichette: Record<string, string> = {
      nuovo: 'Nuovo',
      in_preparazione: 'In Preparazione',
      pronto: 'Pronto',
      servito: 'Servito',
      in_consegna: 'In Consegna',
      consegnato: 'Consegnato',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colori[stato] || 'bg-gray-100 text-gray-800'}`}>
        {etichette[stato] || stato}
      </span>
    );
  };

  const prenotazioneBadge = (stato: string) => {
    const colori: Record<string, string> = {
      confermata: 'bg-green-100 text-green-800',
      in_attesa: 'bg-yellow-100 text-yellow-800',
      cancellata: 'bg-red-100 text-red-800',
    };
    const etichette: Record<string, string> = {
      confermata: 'Confermata',
      in_attesa: 'In Attesa',
      cancellata: 'Cancellata',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colori[stato] || 'bg-gray-100 text-gray-800'}`}>
        {etichette[stato] || stato}
      </span>
    );
  };

  if (caricamento) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 lg:mb-8">Dashboard</h1>

      {/* Cards riassuntive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ordini Attivi</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{ordiniAttivi.length}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <span className="text-2xl">{'\u{1F4CB}'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Prenotazioni Oggi</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{prenotazioniOggi.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-2xl">{'\u{1F4C5}'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Alert Scorte Basse</p>
              <p className={`text-3xl font-bold mt-1 ${scorteBasse.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {scorteBasse.length}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${scorteBasse.length > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <span className="text-2xl">{'\u{26A0}\uFE0F'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ordini recenti */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Ordini Recenti</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {ordiniRecenti.length === 0 ? (
              <p className="p-6 text-gray-500 text-sm">Nessun ordine presente.</p>
            ) : (
              ordiniRecenti.map((ordine) => (
                <div key={ordine.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      #{ordine.id} - {ordine.tipo === 'tavolo' ? `Tavolo ${ordine.tavolo_id}` : 'Delivery'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {ordine.piatti?.map((p) => `${p.nome} x${p.quantita}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {statoBadge(ordine.stato)}
                    <span className="text-sm font-semibold text-gray-900">
                      {'\u20AC'}{Number(ordine.totale).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prenotazioni di oggi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Prenotazioni di Oggi</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {prenotazioniOggi.length === 0 ? (
              <p className="p-6 text-gray-500 text-sm">Nessuna prenotazione per oggi.</p>
            ) : (
              prenotazioniOggi.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.nome}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ore {p.ora} - {p.persone} persone
                    </p>
                    {p.note && <p className="text-xs text-gray-400 mt-0.5">{p.note}</p>}
                  </div>
                  <div>{prenotazioneBadge(p.stato)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Scorte basse */}
      {scorteBasse.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-red-200">
          <div className="p-6 border-b border-red-200 bg-red-50 rounded-t-xl">
            <h2 className="text-lg font-semibold text-red-800">
              {'\u{26A0}\uFE0F'} Ingredienti con Scorta Bassa
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {scorteBasse.map((ing) => (
              <div key={ing.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{ing.nome}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimo: {Number(ing.minimo_scorta)} {ing.unita}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    {Number(ing.quantita)} {ing.unita}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
