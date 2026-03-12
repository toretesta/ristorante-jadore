import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function ContattiPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950 pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Contatti</h1>
            <p className="text-gray-300 text-lg">Vieni a trovarci o contattaci</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Dove Siamo</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">📍</span>
                    <div>
                      <p className="font-medium text-gray-800">Indirizzo</p>
                      <p className="text-sm text-gray-500">Via Abate Felice Toscano n.22<br/>Pomigliano d&apos;Arco (NA)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">📞</span>
                    <div>
                      <p className="font-medium text-gray-800">Telefono</p>
                      <a href="tel:+393349803348" className="text-sm text-amber-600 hover:text-amber-700 transition">
                        334 9803348
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🎵</span>
                    <div>
                      <p className="font-medium text-gray-800">TikTok</p>
                      <a
                        href="https://www.tiktok.com/@jadore_ristorante"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber-600 hover:text-amber-700 transition"
                      >
                        @jadore_ristorante
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Orari di Apertura</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Lunedi - Venerdi</span>
                    <span className="text-gray-500">12:00 - 15:00 / 19:00 - 23:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Sabato - Domenica</span>
                    <span className="text-gray-500">12:00 - 15:30 / 19:00 - 23:30</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                  <span>🪴</span>
                  <span>Giardino esterno disponibile nella bella stagione</span>
                </div>
              </div>

              {/* CTA */}
              <a
                href="/prenota"
                className="block text-center px-6 py-3.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition shadow-md"
              >
                Prenota un Tavolo
              </a>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3019.876!2d14.3861!3d40.9102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133b9a5e7d0a0001%3A0x1!2sVia%20Abate%20Felice%20Toscano%2C%2022%2C%20Pomigliano%20d&#39;Arco%20NA!5e0!3m2!1sit!2sit!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="J'adore Ristorante - Mappa"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
