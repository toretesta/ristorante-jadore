'use client';

import { useEffect, useState } from 'react';

interface Menu {
  id: number;
  nome: string;
  descrizione: string;
  attivo: boolean;
  ordine: number;
}

interface Categoria {
  id: number;
  menu_id: number;
  nome: string;
  ordine: number;
}

interface Piatto {
  id: number;
  categoria_id: number;
  nome: string;
  descrizione: string;
  prezzo: number;
  allergeni: string[];
  disponibile: boolean;
  immagine: string;
}

const piattoVuoto = {
  nome: '',
  descrizione: '',
  prezzo: 0,
  categoria_id: 0,
  allergeni: [] as string[],
  disponibile: true,
  immagine: '',
};

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [piatti, setPiatti] = useState<Piatto[]>([]);
  const [caricamento, setCaricamento] = useState(true);

  // Selezione menu e categoria attiva
  const [menuAttivo, setMenuAttivo] = useState<number>(0);
  const [categoriaAttiva, setCategoriaAttiva] = useState<number>(0);

  // Form piatto
  const [mostraFormPiatto, setMostraFormPiatto] = useState(false);
  const [piattoInModifica, setPiattoInModifica] = useState<Piatto | null>(null);
  const [formPiatto, setFormPiatto] = useState(piattoVuoto);
  const [allergeniInput, setAllergeniInput] = useState('');

  // Form categoria
  const [mostraFormCategoria, setMostraFormCategoria] = useState(false);
  const [nuovaCategoriaNome, setNuovaCategoriaNome] = useState('');
  const [categoriaInModifica, setCategoriaInModifica] = useState<Categoria | null>(null);
  const [categoriaModificaNome, setCategoriaModificaNome] = useState('');

  // Form menu
  const [mostraFormMenu, setMostraFormMenu] = useState(false);
  const [formMenu, setFormMenu] = useState({ nome: '', descrizione: '', attivo: false });
  const [menuInModifica, setMenuInModifica] = useState<Menu | null>(null);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      setMenus(data.menus || []);
      setCategorie(data.categorie || []);
      setPiatti(data.piatti || []);
      if (!menuAttivo && data.menus?.length > 0) {
        setMenuAttivo(data.menus[0].id);
      }
    } catch (error) {
      console.error('Errore nel caricamento del menu:', error);
    } finally {
      setCaricamento(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quando cambia il menu attivo, seleziona la prima categoria
  useEffect(() => {
    const categorieMenu = categorie.filter(c => c.menu_id === menuAttivo);
    if (categorieMenu.length > 0) {
      setCategoriaAttiva(categorieMenu[0].id);
    } else {
      setCategoriaAttiva(0);
    }
  }, [menuAttivo, categorie]);

  // --- PIATTO CRUD ---
  const apriFormNuovoPiatto = () => {
    setPiattoInModifica(null);
    setFormPiatto({ ...piattoVuoto, categoria_id: categoriaAttiva });
    setAllergeniInput('');
    setMostraFormPiatto(true);
  };

  const apriFormModificaPiatto = (piatto: Piatto) => {
    setPiattoInModifica(piatto);
    setFormPiatto({
      nome: piatto.nome,
      descrizione: piatto.descrizione,
      prezzo: piatto.prezzo,
      categoria_id: piatto.categoria_id,
      allergeni: piatto.allergeni,
      disponibile: piatto.disponibile,
      immagine: piatto.immagine,
    });
    setAllergeniInput((piatto.allergeni || []).join(', '));
    setMostraFormPiatto(true);
  };

  const salvaPiatto = async () => {
    const allergeni = allergeniInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (piattoInModifica) {
      const res = await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: piattoInModifica.id, ...formPiatto, allergeni }),
      });
      if (res.ok) {
        setMostraFormPiatto(false);
        fetchMenu();
      }
    } else {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formPiatto, allergeni }),
      });
      if (res.ok) {
        setMostraFormPiatto(false);
        fetchMenu();
      }
    }
  };

  const eliminaPiatto = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo piatto?')) return;
    const res = await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchMenu();
  };

  const toggleDisponibilita = async (id: number) => {
    const res = await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_disponibilita', id }),
    });
    if (res.ok) fetchMenu();
  };

  // --- MENU CRUD ---
  const apriFormNuovoMenu = () => {
    setMenuInModifica(null);
    setFormMenu({ nome: '', descrizione: '', attivo: false });
    setMostraFormMenu(true);
  };

  const apriFormModificaMenu = (menu: Menu) => {
    setMenuInModifica(menu);
    setFormMenu({ nome: menu.nome, descrizione: menu.descrizione, attivo: menu.attivo });
    setMostraFormMenu(true);
  };

  const salvaMenu = async () => {
    if (!formMenu.nome.trim()) return;
    if (menuInModifica) {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_menu', id: menuInModifica.id, ...formMenu }),
      });
    } else {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_menu', ...formMenu }),
      });
    }
    setMostraFormMenu(false);
    fetchMenu();
  };

  const toggleMenu = async (id: number) => {
    await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_menu', id }),
    });
    fetchMenu();
  };

  const eliminaMenu = async (id: number) => {
    if (!confirm('Sei sicuro? Tutte le categorie e i piatti di questo menu verranno eliminati.')) return;
    await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_menu', id }),
    });
    if (menuAttivo === id) {
      const restanti = menus.filter(m => m.id !== id);
      setMenuAttivo(restanti[0]?.id || 0);
    }
    fetchMenu();
  };

  // --- CATEGORIA CRUD ---
  const aggiungiCategoria = async () => {
    if (!nuovaCategoriaNome.trim() || !menuAttivo) return;
    const res = await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_categoria', menu_id: menuAttivo, nome: nuovaCategoriaNome.trim() }),
    });
    if (res.ok) {
      setNuovaCategoriaNome('');
      fetchMenu();
    }
  };

  const salvaModificaCategoria = async () => {
    if (!categoriaInModifica || !categoriaModificaNome.trim()) return;
    const res = await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_categoria', id: categoriaInModifica.id, nome: categoriaModificaNome.trim() }),
    });
    if (res.ok) {
      setCategoriaInModifica(null);
      setCategoriaModificaNome('');
      fetchMenu();
    }
  };

  const eliminaCategoria = async (id: number) => {
    if (!confirm('Sei sicuro? I piatti associati verranno eliminati.')) return;
    const res = await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_categoria', id }),
    });
    if (res.ok) fetchMenu();
  };

  const categorieMenu = categorie.filter(c => c.menu_id === menuAttivo);
  const piattiFiltrati = piatti.filter((p) => p.categoria_id === categoriaAttiva);
  const categoriePerFormPiatto = categorie.filter(c => c.menu_id === menuAttivo);

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
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestione Menu</h1>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={apriFormNuovoMenu}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            + Nuovo Menu
          </button>
          <button
            onClick={() => setMostraFormCategoria(!mostraFormCategoria)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Categorie
          </button>
          <button
            onClick={apriFormNuovoPiatto}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            + Piatto
          </button>
        </div>
      </div>

      {/* Selezione Menu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {menus.map((menu) => (
            <div key={menu.id} className="flex items-center gap-1">
              <button
                onClick={() => setMenuAttivo(menu.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  menuAttivo === menu.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {menu.nome}
                {!menu.attivo && (
                  <span className="ml-1.5 text-xs opacity-70">(off)</span>
                )}
              </button>
              <button
                onClick={() => toggleMenu(menu.id)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  menu.attivo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
                title={menu.attivo ? 'Disattiva menu' : 'Attiva menu'}
              >
                {menu.attivo ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => apriFormModificaMenu(menu)}
                className="p-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs hover:bg-yellow-200"
                title="Modifica"
              >
                Mod
              </button>
              <button
                onClick={() => eliminaMenu(menu.id)}
                className="p-1.5 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200"
                title="Elimina"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Menu */}
      {mostraFormMenu && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {menuInModifica ? 'Modifica Menu' : 'Nuovo Menu'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Menu</label>
              <input
                type="text"
                value={formMenu.nome}
                onChange={(e) => setFormMenu({ ...formMenu, nome: e.target.value })}
                placeholder="es. Menu del Weekend, Menu Pranzo..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
              <input
                type="text"
                value={formMenu.descrizione}
                onChange={(e) => setFormMenu({ ...formMenu, descrizione: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formMenu.attivo}
              onChange={(e) => setFormMenu({ ...formMenu, attivo: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Attivo (visibile ai clienti)</span>
          </label>
          <div className="flex gap-3 mt-4">
            <button onClick={salvaMenu} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              {menuInModifica ? 'Salva' : 'Crea Menu'}
            </button>
            <button onClick={() => setMostraFormMenu(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Gestione Categorie */}
      {mostraFormCategoria && menuAttivo > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Categorie di &quot;{menus.find(m => m.id === menuAttivo)?.nome}&quot;
          </h3>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Nome nuova categoria"
              value={nuovaCategoriaNome}
              onChange={(e) => setNuovaCategoriaNome(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={aggiungiCategoria} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              Aggiungi
            </button>
          </div>
          <div className="space-y-2">
            {categorieMenu.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                {categoriaInModifica?.id === cat.id ? (
                  <div className="flex gap-2 flex-1 mr-3">
                    <input
                      type="text"
                      value={categoriaModificaNome}
                      onChange={(e) => setCategoriaModificaNome(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={salvaModificaCategoria} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Salva</button>
                    <button onClick={() => setCategoriaInModifica(null)} className="px-3 py-1.5 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500">Annulla</button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-900">{cat.nome}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setCategoriaInModifica(cat); setCategoriaModificaNome(cat.nome); }}
                        className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600"
                      >
                        Modifica
                      </button>
                      <button onClick={() => eliminaCategoria(cat.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600">
                        Elimina
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {categorieMenu.length === 0 && (
              <p className="text-sm text-gray-500">Nessuna categoria. Aggiungine una per iniziare.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab categorie del menu selezionato */}
      {categorieMenu.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {categorieMenu.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAttiva(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoriaAttiva === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      )}

      {/* Form piatto */}
      {mostraFormPiatto && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {piattoInModifica ? 'Modifica Piatto' : 'Nuovo Piatto'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formPiatto.nome}
                onChange={(e) => setFormPiatto({ ...formPiatto, nome: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo ({'\u20AC'})</label>
              <input
                type="number"
                step="0.50"
                value={formPiatto.prezzo}
                onChange={(e) => setFormPiatto({ ...formPiatto, prezzo: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
              <textarea
                value={formPiatto.descrizione}
                onChange={(e) => setFormPiatto({ ...formPiatto, descrizione: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={formPiatto.categoria_id}
                onChange={(e) => setFormPiatto({ ...formPiatto, categoria_id: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>-- Seleziona --</option>
                {categoriePerFormPiatto.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergeni (separati da virgola)</label>
              <input
                type="text"
                value={allergeniInput}
                onChange={(e) => setAllergeniInput(e.target.value)}
                placeholder="glutine, lattosio, uova"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Immagine</label>
              <input
                type="text"
                value={formPiatto.immagine}
                onChange={(e) => setFormPiatto({ ...formPiatto, immagine: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formPiatto.disponibile}
                  onChange={(e) => setFormPiatto({ ...formPiatto, disponibile: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Disponibile</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={salvaPiatto} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              {piattoInModifica ? 'Salva Modifiche' : 'Aggiungi Piatto'}
            </button>
            <button onClick={() => setMostraFormPiatto(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Lista piatti */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {categorieMenu.find((c) => c.id === categoriaAttiva)?.nome || 'Seleziona una categoria'}
          </h2>
        </div>
        {piattiFiltrati.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">Nessun piatto in questa categoria.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {piattiFiltrati.map((piatto) => (
              <div key={piatto.id} className={`p-4 ${!piatto.disponibile ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900">{piatto.nome}</p>
                      <span className="text-sm font-semibold text-indigo-600">
                        {'\u20AC'}{Number(piatto.prezzo).toFixed(2)}
                      </span>
                      {!piatto.disponibile && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Non disponibile</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{piatto.descrizione}</p>
                    {piatto.allergeni && piatto.allergeni.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {piatto.allergeni.map((a) => (
                          <span key={a} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => toggleDisponibilita(piatto.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      piatto.disponibile
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {piatto.disponibile ? 'Disattiva' : 'Attiva'}
                  </button>
                  <button
                    onClick={() => apriFormModificaPiatto(piatto)}
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => eliminaPiatto(piatto.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
