'use client';
import { useRouter } from 'next/navigation';
import { LogOut, CloudSun } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
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
          Hola, <span className="text-slate-700">Usuario</span>
        </span>
        <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition">
          <LogOut className="w-4 h-4 mr-1.5" /> Salir
        </button>
      </div>
    </nav>
  );
}