'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, CloudSun, Loader2 } from 'lucide-react';
import { authLogout, getStoredUsuario } from '@/services/api';
import { Usuario } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Se lee localStorage aquí (no durante el render) para evitar un
    // hydration mismatch: el servidor no tiene acceso a localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsuario(getStoredUsuario());
  }, []);

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await authLogout();
    } finally {
      router.push('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center gap-3">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <div className="bg-blue-600 p-1.5 sm:p-2 rounded-xl shadow-sm flex-shrink-0">
          <CloudSun className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <span className="text-base sm:text-xl font-bold text-slate-900 truncate">
          Plan Meteorológico
        </span>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-6 flex-shrink-0">
        <span className="hidden sm:inline text-slate-500 text-sm">
          Hola, <span className="text-slate-700">{usuario?.name ?? 'Usuario'}</span>
        </span>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition"
        >
          <LogOut className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mx-auto mb-5">
              <LogOut className="w-7 h-7 text-red-500" />
            </div>

            <h3 className="font-extrabold text-xl mb-2 text-slate-800 text-center">
              ¿Cerrar sesión?
            </h3>
            <p className="text-slate-500 text-center mb-8">
              Tendrás que volver a iniciar sesión para acceder a tu planificador.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="flex-1 px-5 py-3 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                disabled={loggingOut}
                className="flex-1 px-5 py-3 font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {loggingOut && <Loader2 className="w-4 h-4 animate-spin" />}
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}