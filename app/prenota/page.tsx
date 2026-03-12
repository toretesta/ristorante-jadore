'use client';

import { useState } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function PrenotaPage() {
  const [nome, setNome] = useState('');
  const [telefono, setTelefono] = useState('');
  const [data, setData] = useState('');
  const [ora, setOra] = useState('');
  const [persone, setPersone] = useState(2);
  const [note, setNote] = useState('');
  const [inviata, setInviata] = useState(false);
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvio(true);
    setErrore('');

    try {
      const prenotazione = {
        nome,
        data,
        ora,
        persone,
        tavolo_id: null,
        telefono,
        note,
        stato: 'in_attesa',
      };
      const res = await fetch('/api/prenotazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prenotazione),
      });
      if (res.ok) {
        setInviata(true);
      } else {
        setErrore('Errore nell\'invio. Riprova.');
      }
    } catch {
      setErrore('Errore di connessione. Riprova.');
    } finally {
      setInvio(false);
    }
  };

  const oggi = new Date().toISOString().split('T')[0];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950 pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Prenota un Tavolo</h1>
            <p className="text-gray-300 text-lg">Riserva il tuo posto da J&apos;adore</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-12">
          {inviata ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Prenotazione Inviata!</h2>
              <p className="text-gray-600 mb-2">
                La tua richiesta di prenotazione e stata ricevuta.
              </p>
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 mb-6">
                Il personale del ristorante confermera la tua prenotazione a breve.
              </p>
              <button
                onClick={() => {
                  setInviata(false);
                  setNome('');
                  setTelefono('');
                  setData('');
                  setOra('');
                  setPersone(2);
                  setNote('');
                }}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                Nuova Prenotazione
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="Il tuo nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="333 1234567"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      required
                      min={oggi}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ora *</label>
                    <input
                      type="time"
                      value={ora}
                      onChange={(e) => setOra(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numero di persone *</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setPersone(Math.max(1, persone - 1))}
                      className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-300 transition"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-gray-800 w-8 text-center">{persone}</span>
                    <button
                      type="button"
                      onClick={() => setPersone(Math.min(20, persone + 1))}
                      className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center hover:bg-amber-700 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    rows={3}
                    placeholder="Es. allergie, occasione speciale, seggiolone, giardino esterno..."
                  />
                </div>

                {errore && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {errore}
                  </div>
                )}

                <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                  La prenotazione sara confermata dal personale del ristorante.
                </div>

                <button
                  type="submit"
                  disabled={invio}
                  className="w-full bg-amber-600 text-white py-3.5 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {invio ? 'Invio in corso...' : 'Invia Prenotazione'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
