'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '\u{1F4CA}' },
  { href: '/admin/menu', label: 'Menu', icon: '\u{1F4D6}' },
  { href: '/admin/ordini', label: 'Ordini', icon: '\u{1F4CB}' },
  { href: '/admin/magazzino', label: 'Magazzino', icon: '\u{1F4E6}' },
  { href: '/admin/tavoli', label: 'Tavoli', icon: '\u{1FA91}' },
  { href: '/admin/prenotazioni', label: 'Prenotazioni', icon: '\u{1F4C5}' },
  { href: '/admin/delivery', label: 'Delivery', icon: '\u{1F6F5}' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [aperto, setAperto] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setAperto(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (aperto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [aperto]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setAperto(!aperto)}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {aperto ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <h1 className="text-base font-bold tracking-tight">
          {'\u{1F35D}'} J&apos;adore Ristorante
        </h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Overlay */}
      {aperto && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setAperto(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col shrink-0 transform transition-transform duration-200 ease-in-out lg:transform-none ${
          aperto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-tight">
            {'\u{1F35D}'} J&apos;adore Ristorante
          </h1>
          <p className="text-gray-400 text-sm mt-1">Pannello di Gestione</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <span className="text-lg">{'\u{1F6AA}'}</span>
            Esci
          </button>
        </div>
      </aside>
    </>
  );
}
