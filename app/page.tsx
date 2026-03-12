'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import HeroSection from '@/components/public/HeroSection';
import Footer from '@/components/public/Footer';

interface Piatto {
  id: string;
  nome: string;
  descrizione: string;
  prezzo: number;
  categoria: string;
  disponibile: boolean;
}

export default function HomePage() {
  const [piattiInEvidenza, setPiattiInEvidenza] = useState<Piatto[]>([]);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        const disponibili = data.piatti.filter((p: Piatto) => p.disponibile);
        setPiattiInEvidenza(disponibili.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <HeroSection />

      {/* Il Nostro Ristorante */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Il Nostro Ristorante</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Un&apos;esperienza culinaria unica nel cuore di Pomigliano d&apos;Arco,
              dove tradizione e passione si incontrano.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-amber-50/50 border border-amber-100">
              <div className="text-4xl mb-3">🪴</div>
              <h3 className="font-semibold text-gray-800 mb-2">Giardino Esterno</h3>
              <p className="text-sm text-gray-500">
                Goditi i nostri piatti all&apos;aperto nel nostro splendido giardino.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-amber-50/50 border border-amber-100">
              <div className="text-4xl mb-3">👨‍🍳</div>
              <h3 className="font-semibold text-gray-800 mb-2">Cucina Tradizionale</h3>
              <p className="text-sm text-gray-500">
                Piatti della tradizione campana con ingredienti freschi e selezionati.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-amber-50/50 border border-amber-100">
              <div className="text-4xl mb-3">🎠</div>
              <h3 className="font-semibold text-gray-800 mb-2">Per Tutta la Famiglia</h3>
              <p className="text-sm text-gray-500">
                Un ambiente accogliente pensato per grandi e piccini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Piatti in Evidenza */}
      {piattiInEvidenza.length > 0 && (
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Dal Nostro Menu</h2>
              <p className="text-gray-500">Alcuni dei nostri piatti piu amati</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {piattiInEvidenza.map(piatto => (
                <div key={piatto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{piatto.nome}</h3>
                      {piatto.descrizione && (
                        <p className="text-sm text-gray-500 mt-1">{piatto.descrizione}</p>
                      )}
                    </div>
                    <span className="text-lg font-bold text-amber-700 whitespace-nowrap">
                      &euro;{Number(piatto.prezzo).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/il-menu"
                className="inline-block px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                Vedi il Menu Completo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Prenotazione */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prenota il Tuo Tavolo</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Non perdere l&apos;occasione di vivere un&apos;esperienza indimenticabile.
            Prenota ora il tuo tavolo da J&apos;adore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/prenota"
              className="px-8 py-3.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-500 transition text-lg shadow-lg shadow-amber-600/25"
            >
              Prenota Ora
            </Link>
            <a
              href="tel:+393349803348"
              className="px-8 py-3.5 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition text-lg"
            >
              Chiama: 334 9803348
            </a>
          </div>
        </div>
      </section>

      {/* Mappa / Contatti */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Dove Trovarci</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">📍</span>
                <div>
                  <p className="font-medium text-gray-800">Via Abate Felice Toscano n.22</p>
                  <p className="text-sm text-gray-500">Pomigliano d&apos;Arco (NA)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <a href="tel:+393349803348" className="font-medium text-amber-600 hover:text-amber-700 transition">
                  334 9803348
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🎵</span>
                <a
                  href="https://www.tiktok.com/@jadore_ristorante"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-600 hover:text-amber-700 transition"
                >
                  @jadore_ristorante su TikTok
                </a>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3019.876!2d14.3861!3d40.9102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133b9a5e7d0a0001%3A0x1!2sVia%20Abate%20Felice%20Toscano%2C%2022%2C%20Pomigliano%20d&#39;Arco%20NA!5e0!3m2!1sit!2sit!4v1700000000000"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="J'adore Ristorante - Mappa"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
