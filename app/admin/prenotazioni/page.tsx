'use client';

import { useEffect, useState } from 'react';

interface Prenotazione {
  id: number;
  nome: string;
  data: string;
  ora: string;
  persone: number;
  tavolo_id: number | null;
  telefono: string;
  note: string;
  stato: string;
}

interface Tavolo {
  id: number;
  numero: number;
  posti: number;
  stato: string;
}

const statoBadge: Record<string, { colore: string; label: string }> = {
  confermata: { colore: 'bg-green-100 text-green-800', label: 'Confermata' },
  in_attesa: { colore: 'bg-yellow-100 text-yellow-800', label: 'In Attesa' },
  cancellata: { colore: 'bg-red-100 text-red-800', label: 'Cancellata' },
};

const prenotazioneVuota = {
  nome: '',
  data: '',
  ora: '',
  persone: 2,
  tavolo_id: '' as string,
  telefono: '',
  note: '',
};

export default function PrenotazioniPage() {
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [tavoli, setTavoli] = useState<Tavolo[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [mostraForm, setMostraForm] = useState(false);
  const [form, setForm] = useState(prenotazioneVuota);

  const fetchData = async () => {
    try {
      const [prenotazioniRes, tavoliRes] = await Promise.all([
        fetch('/api/prenotazioni'),
        fetch('/api/tavoli'),
      ]);
      const prenotazioniData = await prenotazioniRes.json();
      const tavoliData = await tavoliRes.json();
      setPrenotazioni(prenotazioniData.prenotazioni || []);
      setTavoli(tavoliData.tavoli || []);
    } catch (error) {
      console.error('Errore nel caricamento:', error);
    } finally {
      setCaricamento(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const prenotazioniFiltrate = prenotazioni
    .filter((p) => {
      const dataStr = typeof p.data === 'string' ? p.data.split('T')[0] : '';
      return dataStr === dataFiltro;
    })
    .sort((a, b) => a.ora.localeCompare(b.ora));

  const aggiungiPrenotazione = async () => {
    if (!form.nome.trim() || !form.data || !form.ora) return;
    try {
      const res = await fetch('/api/prenotazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tavolo_id: form.tavolo_id ? parseInt(form.tavolo_id) : null,
          stato: 'in_attesa',
        }),
      });
      if (res.ok) {
        setForm(prenotazioneVuota);
        setMostraForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const aggiornaStato = async (id: number, nuovoStato: string) => {
    try {
      const res = await fetch('/api/prenotazioni', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stato: nuovoStato }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const eliminaPrenotazione = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return;
    try {
      const res = await fetch(`/api/prenotazioni?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const getNomeTavolo = (tavoloId: number | null) => {
    if (!tavoloId) return 'Non assegnato';
    const tavolo = tavoli.find((t) => t.id === tavoloId);
    return tavolo ? `Tavolo ${tavolo.numero} (${tavolo.posti} posti)` : `#${tavoloId}`;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Prenotazioni</h1>
        <button
          onClick={() => { setMostraForm(!mostraForm); setForm({ ...prenotazioneVuota, data: dataFiltro }); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          + Nuova Prenotazione
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
        <label className="text-sm font-medium text-gray-700">Data:</label>
        <input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <span className="text-sm text-gray-500">
          {prenotazioniFiltrate.length} prenotazion{prenotazioniFiltrate.length === 1 ? 'e' : 'i'}
        </span>
      </div>

      {mostraForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuova Prenotazione</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ora</label>
              <input type="time" value={form.ora} onChange={(e) => setForm({ ...form, ora: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Persone</label>
              <input type="number" min="1" value={form.persone} onChange={(e) => setForm({ ...form, persone: parseInt(e.target.value) || 1 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tavolo</label>
              <select value={form.tavolo_id} onChange={(e) => setForm({ ...form, tavolo_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">-- Seleziona --</option>
                {tavoli.map((t) => (
                  <option key={t.id} value={t.id}>Tavolo {t.numero} ({t.posti} posti) - {t.stato}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={aggiungiPrenotazione} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">Conferma Prenotazione</button>
            <button onClick={() => setMostraForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">Annulla</button>
          </div>
        </div>
      )}

      {prenotazioniFiltrate.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Nessuna prenotazione per questa data.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prenotazioniFiltrate.map((pren) => {
            const badge = statoBadge[pren.stato] || statoBadge.in_attesa;
            return (
              <div key={pren.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{pren.nome}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.colore}`}>{badge.label}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-sm">
                  <div><span className="text-gray-500">Ora:</span> <span className="font-medium text-gray-900">{pren.ora}</span></div>
                  <div><span className="text-gray-500">Persone:</span> <span className="font-medium text-gray-900">{pren.persone}</span></div>
                  <div><span className="text-gray-500">Tavolo:</span> <span className="font-medium text-gray-900">{getNomeTavolo(pren.tavolo_id)}</span></div>
                  <div><span className="text-gray-500">Tel:</span> <span className="font-medium text-gray-900">{pren.telefono}</span></div>
                </div>
                {pren.note && (
                  <p className="mt-2 text-sm text-gray-500"><span className="font-medium">Note:</span> {pren.note}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                  {pren.stato !== 'confermata' && pren.stato !== 'cancellata' && (
                    <button onClick={() => aggiornaStato(pren.id, 'confermata')}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">Conferma</button>
                  )}
                  {pren.stato !== 'cancellata' && (
                    <button onClick={() => aggiornaStato(pren.id, 'cancellata')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">Cancella</button>
                  )}
                  <button onClick={() => eliminaPrenotazione(pren.id)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">Elimina</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
