'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autenticato, setAutenticato] = useState(false);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    const verificaAuth = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data.authenticated) {
          setAutenticato(true);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setCaricamento(false);
      }
    };
    verificaAuth();
  }, [router]);

  if (caricamento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!autenticato) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-4 pt-16 lg:p-8 lg:pt-8 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
