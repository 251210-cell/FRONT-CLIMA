'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CloudSun, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { authLogin, getApiErrorMessage } from '@/services/api';
import { useToast } from '@/components/ToastProvider';

function ExpiredSessionAlert() {
  const searchParams = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      toast.warning('Tu sesión expiró', 'Por favor inicia sesión de nuevo para continuar.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authLogin({ email, password });
      toast.success('¡Bienvenido de nuevo!');
      router.push('/dashboard');
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error('No se pudo iniciar sesión', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <ExpiredSessionAlert />
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400">
        {/* Ondas decorativas */}
        <svg
          className="absolute bottom-0 left-0 w-full h-2/3 opacity-90"
          viewBox="0 0 800 600"
          preserveAspectRatio="none"
        >
          <path
            d="M0,300 C150,380 250,220 400,300 C550,380 650,250 800,320 L800,600 L0,600 Z"
            fill="rgba(255,255,255,0.10)"
          />
          <path
            d="M0,380 C180,300 300,460 450,400 C600,340 680,460 800,400 L800,600 L0,600 Z"
            fill="rgba(255,255,255,0.14)"
          />
        </svg>

        <div className="relative z-10 flex flex-col justify-between w-full p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white/15 p-2.5 rounded-2xl backdrop-blur-sm">
              <CloudSun className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">Plan Meteorológico</h2>
              <p className="text-sm text-white/80">Planifica tu día según el clima</p>
            </div>
          </div>

          {/* Texto principal */}
          <div className="max-w-md">
            <h1 className="text-5xl font-extrabold leading-tight mb-4">
              Cada plan,<br />mejor con el clima.
            </h1>
            <p className="text-white/85 text-lg">
              Consulta el pronóstico, organiza tus actividades y recibe alertas antes de salir.
            </p>
          </div>

          <div />
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <CloudSun className="w-14 h-14 text-blue-600 mb-4" />
            <h1 className="text-3xl font-extrabold text-slate-900">Inicia sesión</h1>
            <p className="text-slate-500 mt-2 text-center">
              Bienvenido de nuevo. Ingresa tus datos para continuar.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@correo.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Iniciar sesión
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-800 hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}