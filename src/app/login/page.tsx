'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Cloud } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard'); 
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534088568595-a066f410cbda?q=80&w=2000&auto=format&fit=crop')" }}
    >
      {/* Capa oscura para que resalte la tarjeta */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>

      {/* Tarjeta Glassmorphism */}
      <div className="relative bg-white/95 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full mb-3 shadow-lg">
            <Cloud className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">WeatherPlan</h1>
          <p className="text-slate-500 mt-1">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="correo@ejemplo.com"
              className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
            Iniciar Sesión
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-600 font-medium">
          ¿No tienes cuenta? <Link href="/register" className="text-blue-600 hover:text-blue-800 hover:underline">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}