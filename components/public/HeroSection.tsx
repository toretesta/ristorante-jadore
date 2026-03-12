import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(217,119,6,0.1),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <div className="text-6xl sm:text-7xl mb-6 animate-pulse">🍝</div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
          J&apos;adore
          <span className="block text-amber-400 mt-1">Ristorante</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-3 max-w-xl mx-auto">
          Un&apos;esperienza culinaria raffinata nel cuore di Pomigliano d&apos;Arco
        </p>
        <p className="text-sm text-amber-400/80 mb-8 flex items-center justify-center gap-2">
          <span>🪴</span> Con giardino esterno <span>🎠</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/il-menu"
            className="px-8 py-3.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-500 transition-colors text-lg shadow-lg shadow-amber-600/25"
          >
            Scopri il Menu
          </Link>
          <Link
            href="/prenota"
            className="px-8 py-3.5 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg"
          >
            Prenota un Tavolo
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
