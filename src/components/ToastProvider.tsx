'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const STYLES: Record<
  ToastType,
  { bg: string; border: string; text: string; icon: React.ElementType }
> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle2,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: Info,
  },
};

const DEFAULT_DURATION_MS = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      window.setTimeout(() => dismiss(id), DEFAULT_DURATION_MS);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    showToast,
    success: (title, description) => showToast('success', title, description),
    error: (title, description) => showToast('error', title, description),
    warning: (title, description) => showToast('warning', title, description),
    info: (title, description) => showToast('info', title, description),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Contenedor de alertas, fijo en la esquina superior derecha */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((toast) => {
          const style = STYLES[toast.type];
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              role="alert"
              className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${style.bg} ${style.border}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.text}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${style.text}`}>{toast.title}</p>
                {toast.description && (
                  <p className={`text-sm mt-0.5 ${style.text} opacity-80`}>
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className={`flex-shrink-0 ${style.text} opacity-60 hover:opacity-100 transition`}
                aria-label="Cerrar alerta"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de un <ToastProvider>');
  }
  return ctx;
}