'use client';

import { useEffect, useState } from 'react';

interface Ingrediente {
  id: number;
  nome: string;
  quantita: number;
  unita: string;
  minimo_scorta: number;
}

const ingredienteVuoto = {
  nome: '',
  quantita: 0,
  unita: 'kg',
  minimo_scorta: 0,
};

export default function MagazzinoPage() {
  const [ingredienti, setIngredienti] = useState<Ingrediente[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [mostraForm, setMostraForm] = useState(false);
  const [form, setForm] = useState(ingredienteVuoto);
  const [modificaId, setModificaId] = useState<number | null>(null);
  const [modificaQuantita, setModificaQuantita] = useState<number>(0);

  const fetchMagazzino = async () => {
    try {
      const res = await fetch('/api/magazzino');
      const data = await res.json();
      setIngredienti(data.ingredienti || []);
    } catch (error) {
      console.error('Errore nel caricamento del magazzino:', error);
    } finally {
      setCaricamento(false);
    }
  };

  useEffect(() => {
    fetchMagazzino();
  }, []);

  const aggiungiIngrediente = async () => {
    if (!form.nome.trim()) return;
    try {
      const res = await fetch('/api/magazzino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(ingredienteVuoto);
        setMostraForm(false);
        fetchMagazzino();
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const aggiornaQuantita = async (id: number, quantita: number) => {
    try {
      const res = await fetch('/api/magazzino', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantita }),
      });
      if (res.ok) {
        setModificaId(null);
        fetchMagazzino();
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const eliminaIngrediente = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo ingrediente?')) return;
    try {
      const res = await fetch(`/api/magazzino?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchMagazzino();
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const scortaBassa = (ing: Ingrediente) => Number(ing.quantita) <= Number(ing.minimo_scorta);
  const countScorteBasse = ingredienti.filter(scortaBassa).length;

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
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Magazzino</h1>
          {countScorteBasse > 0 && (
            <p className="text-sm text-red-600 mt-1">
              {'\u{26A0}\uFE0F'} {countScorteBasse} ingredient{countScorteBasse === 1 ? 'e' : 'i'} con scorta bassa
            </p>
          )}
        </div>
        <button
          onClick={() => { setMostraForm(!mostraForm); setForm(ingredienteVuoto); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          + Aggiungi Ingrediente
        </button>
      </div>

      {mostraForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuovo Ingrediente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantita</label>
              <input type="number" step="0.5" value={form.quantita} onChange={(e) => setForm({ ...form, quantita: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unita</label>
              <select value={form.unita} onChange={(e) => setForm({ ...form, unita: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="kg">kg</option><option value="lt">lt</option><option value="pz">pz</option><option value="g">g</option><option value="ml">ml</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimo Scorta</label>
              <input type="number" step="0.5" value={form.minimo_scorta} onChange={(e) => setForm({ ...form, minimo_scorta: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={aggiungiIngrediente} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">Aggiungi</button>
            <button onClick={() => setMostraForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">Annulla</button>
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ingrediente</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantita</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unita</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Minimo Scorta</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stato</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ingredienti.map((ing) => (
              <tr key={ing.id} className={scortaBassa(ing) ? 'bg-red-50' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4"><span className="text-sm font-medium text-gray-900">{ing.nome}</span></td>
                <td className="px-6 py-4">
                  {modificaId === ing.id ? (
                    <div className="flex items-center gap-2">
                      <input type="number" step="0.5" value={modificaQuantita} onChange={(e) => setModificaQuantita(parseFloat(e.target.value) || 0)}
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" autoFocus />
                      <button onClick={() => aggiornaQuantita(ing.id, modificaQuantita)} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">OK</button>
                      <button onClick={() => setModificaId(null)} className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500">No</button>
                    </div>
                  ) : (
                    <span className={`text-sm font-semibold ${scortaBassa(ing) ? 'text-red-600' : 'text-gray-900'}`}>{Number(ing.quantita)}</span>
                  )}
                </td>
                <td className="px-6 py-4"><span className="text-sm text-gray-600">{ing.unita}</span></td>
                <td className="px-6 py-4"><span className="text-sm text-gray-600">{Number(ing.minimo_scorta)}</span></td>
                <td className="px-6 py-4">
                  {scortaBassa(ing) ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Scorta Bassa</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">OK</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setModificaId(ing.id); setModificaQuantita(Number(ing.quantita)); }}
                      className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors">Modifica Qty</button>
                    <button onClick={() => eliminaIngrediente(ing.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">Elimina</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ingredienti.length === 0 && (<p className="p-6 text-gray-500 text-sm text-center">Nessun ingrediente nel magazzino.</p>)}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {ingredienti.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">Nessun ingrediente nel magazzino.</p>
          </div>
        ) : (
          ingredienti.map((ing) => (
            <div key={ing.id} className={`bg-white rounded-xl shadow-sm border ${scortaBassa(ing) ? 'border-red-200 bg-red-50' : 'border-gray-200'} p-4`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{ing.nome}</h3>
                {scortaBassa(ing) ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Scorta Bassa</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">OK</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500 text-xs">Quantita</span>
                  <p className={`font-semibold ${scortaBassa(ing) ? 'text-red-600' : 'text-gray-900'}`}>{Number(ing.quantita)} {ing.unita}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Min. Scorta</span>
                  <p className="font-medium text-gray-700">{Number(ing.minimo_scorta)} {ing.unita}</p>
                </div>
              </div>
              {modificaId === ing.id ? (
                <div className="flex items-center gap-2">
                  <input type="number" step="0.5" value={modificaQuantita} onChange={(e) => setModificaQuantita(parseFloat(e.target.value) || 0)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" autoFocus />
                  <button onClick={() => aggiornaQuantita(ing.id, modificaQuantita)} className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">OK</button>
                  <button onClick={() => setModificaId(null)} className="px-3 py-2 bg-gray-400 text-white rounded-lg text-xs font-medium hover:bg-gray-500">No</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setModificaId(ing.id); setModificaQuantita(Number(ing.quantita)); }}
                    className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors">Modifica Qty</button>
                  <button onClick={() => eliminaIngrediente(ing.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">Elimina</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
