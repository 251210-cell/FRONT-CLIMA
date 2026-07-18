'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, CloudSun } from 'lucide-react';
import { authLogout, getStoredUsuario } from '@/services/api';
import { Usuario } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    // Se lee localStorage aquí (no durante el render) para evitar un
    // hydration mismatch: el servidor no tiene acceso a localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsuario(getStoredUsuario());
  }, []);

  const handleLogout = async () => {
    try {
      await authLogout();
    } finally {
      router.push('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
          <CloudSun className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900">Plan Meteorológico</span>
      </div>
      <div className="flex items-center space-x-6">
        <span className="text-slate-500 text-sm">
          Hola, <span className="text-slate-700">{usuario?.name ?? 'Usuario'}</span>
        </span>
        <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition">
          <LogOut className="w-4 h-4 mr-1.5" /> Salir
        </button>
      </div>
    </nav>
  );
}