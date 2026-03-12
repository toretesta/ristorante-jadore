import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function ChiSiamoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950 pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Chi Siamo</h1>
            <p className="text-gray-300 text-lg">La nostra storia, la nostra passione</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
          {/* Intro */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
              <div className="text-center mb-8">
                <span className="text-5xl">🍝</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
                J&apos;adore Ristorante
              </h2>
              <div className="text-gray-600 leading-relaxed space-y-4 max-w-2xl mx-auto text-center">
                <p>
                  Benvenuti da <strong>J&apos;adore Ristorante</strong>, un angolo di gusto e convivialita
                  nel cuore di <strong>Pomigliano d&apos;Arco</strong>. La nostra cucina celebra i sapori
                  della tradizione campana, rivisitati con creativita e passione.
                </p>
                <p>
                  Ogni piatto racconta una storia fatta di ingredienti freschi, ricette tramandate
                  e l&apos;amore per la buona tavola che ci contraddistingue da sempre.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
              Cosa ci rende speciali
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="text-4xl mb-4">🪴</div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Giardino Esterno</h3>
                <p className="text-sm text-gray-500">
                  Un&apos;oasi verde dove gustare i nostri piatti all&apos;aperto,
                  immersi in un&apos;atmosfera rilassante e accogliente.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="text-4xl mb-4">🎠</div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Spazio Famiglie</h3>
                <p className="text-sm text-gray-500">
                  Un ambiente pensato per tutta la famiglia, dove anche i piu piccoli
                  possono divertirsi in sicurezza.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="text-4xl mb-4">👨‍🍳</div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Cucina Tradizionale</h3>
                <p className="text-sm text-gray-500">
                  Piatti della tradizione campana preparati con ingredienti freschi
                  e selezionati con cura ogni giorno.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Posizione Centrale</h3>
                <p className="text-sm text-gray-500">
                  Situati in Via Abate Felice Toscano n.22, nel cuore di Pomigliano d&apos;Arco,
                  facilmente raggiungibili.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="text-4xl mb-4">🍷</div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Selezione Vini</h3>
                <p className="text-sm text-gray-500">
                  Una carta dei vini curata per accompagnare al meglio ogni piatto,
                  con etichette locali e nazionali.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="text-4xl mb-4">💛</div>
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Passione e Cura</h3>
                <p className="text-sm text-gray-500">
                  Ogni dettaglio e curato con amore, dall&apos;accoglienza al servizio,
                  per rendere ogni visita speciale.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 sm:p-10 border border-amber-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Vieni a trovarci</h2>
            <p className="text-gray-600 mb-6">
              Siamo in Via Abate Felice Toscano n.22, Pomigliano d&apos;Arco.
              Ti aspettiamo!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/prenota"
                className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                Prenota un Tavolo
              </a>
              <a
                href="/contatti"
                className="px-6 py-3 border-2 border-amber-600 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition"
              >
                Contattaci
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
