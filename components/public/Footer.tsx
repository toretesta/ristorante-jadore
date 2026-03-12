import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍝</span>
              <span className="text-xl font-bold text-white">J&apos;adore Ristorante</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Un&apos;esperienza culinaria unica nel cuore di Pomigliano d&apos;Arco.
              Cucina tradizionale con un tocco di eleganza.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigazione</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-amber-400 transition">Home</Link></li>
              <li><Link href="/il-menu" className="hover:text-amber-400 transition">Il Menu</Link></li>
              <li><Link href="/chi-siamo" className="hover:text-amber-400 transition">Chi Siamo</Link></li>
              <li><Link href="/prenota" className="hover:text-amber-400 transition">Prenota</Link></li>
              <li><Link href="/contatti" className="hover:text-amber-400 transition">Contatti</Link></li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contatti</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Via Abate Felice Toscano n.22,<br/>Pomigliano d&apos;Arco (NA)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+393349803348" className="hover:text-amber-400 transition">334 9803348</a>
              </li>
              <li className="flex items-center gap-2">
                <span>🎵</span>
                <a href="https://www.tiktok.com/@jadore_ristorante" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">
                  TikTok
                </a>
              </li>
            </ul>
          </div>

          {/* Orari */}
          <div>
            <h3 className="text-white font-semibold mb-4">Orari</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Lun - Ven</span>
                <span className="text-gray-400">12:00 - 15:00 / 19:00 - 23:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sab - Dom</span>
                <span className="text-gray-400">12:00 - 15:30 / 19:00 - 23:30</span>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-2 text-sm text-amber-400">
              <span>🪴</span>
              <span>Giardino esterno disponibile</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500 space-y-1">
          <p>&copy; {new Date().getFullYear()} J&apos;adore Ristorante. Tutti i diritti riservati.</p>
          <p>
            Website e sistema informatico realizzato da{' '}
            <a href="https://testasalvatore.it" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition">
              Salvatore Testa
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
