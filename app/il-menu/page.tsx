'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

interface Menu {
  id: number;
  nome: string;
  descrizione: string;
  attivo: boolean;
}

interface Piatto {
  id: number;
  categoria_id: number;
  nome: string;
  descrizione: string;
  prezzo: number;
  allergeni: string[];
  disponibile: boolean;
}

interface Categoria {
  id: number;
  menu_id: number;
  nome: string;
  ordine: number;
}

export default function IlMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [piatti, setPiatti] = useState<Piatto[]>([]);
  const [menuAttivo, setMenuAttivo] = useState<number>(0);
  const [categoriaAttiva, setCategoriaAttiva] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/menu?attivi=true')
      .then(res => res.json())
      .then(data => {
        const activeMenus = data.menus || [];
        setMenus(activeMenus);
        setCategorie(data.categorie || []);
        setPiatti((data.piatti || []).filter((p: Piatto) => p.disponibile));
        if (activeMenus.length > 0) setMenuAttivo(activeMenus[0].id);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const cats = categorie.filter(c => c.menu_id === menuAttivo);
    if (cats.length > 0) {
      setCategoriaAttiva(cats[0].id);
    } else {
      setCategoriaAttiva(0);
    }
  }, [menuAttivo, categorie]);

  const categorieMenu = categorie.filter(c => c.menu_id === menuAttivo);
  const piattiFiltrati = piatti.filter(p => p.categoria_id === categoriaAttiva);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950 pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Il Nostro Menu</h1>
            <p className="text-gray-300 text-lg">Scopri i piatti della nostra cucina</p>
          </div>
        </div>

        {/* Menu selector */}
        {menus.length > 1 && (
          <div className="bg-white border-b">
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <div className="flex gap-2 p-3 justify-center">
                {menus.map(menu => (
                  <button key={menu.id} onClick={() => setMenuAttivo(menu.id)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                      menuAttivo === menu.id
                        ? 'bg-amber-700 text-white shadow-md'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}>
                    {menu.nome}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div className="sticky top-16 sm:top-20 z-20 bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <div className="flex gap-1 p-3 justify-center">
              {categorieMenu.map(cat => (
                <button key={cat.id} onClick={() => setCategoriaAttiva(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    categoriaAttiva === cat.id
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {cat.nome}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4 animate-pulse">{'\u{1F35D}'}</div>
              <p className="text-gray-500">Caricamento menu...</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {piattiFiltrati.map(piatto => (
                <div key={piatto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{piatto.nome}</h3>
                      {piatto.descrizione && (
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{piatto.descrizione}</p>
                      )}
                      {piatto.allergeni && piatto.allergeni.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {piatto.allergeni.map(a => (
                            <span key={a} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-bold text-amber-700 whitespace-nowrap">
                      &euro;{Number(piatto.prezzo).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {piattiFiltrati.length === 0 && (
                <p className="text-center text-gray-500 py-12 col-span-2">
                  Nessun piatto disponibile in questa categoria
                </p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
