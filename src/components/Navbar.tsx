'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Cloud } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2 text-blue-600">
        <Cloud className="w-6 h-6" />
        <span className="text-xl font-bold">WeatherPlan</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-slate-600 text-sm">Hola, Usuario</span>
        <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700 text-sm font-medium transition">
          <LogOut className="w-4 h-4 mr-1" /> Salir
        </button>
      </div>
    </nav>
  );
}