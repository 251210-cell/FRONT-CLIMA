'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getCiudadClima, getPlanes } from '@/services/api';
import { Plan, WeatherData } from '@/types';
import { 
  CloudRain, 
  Sun, 
  MapPin, 
  CalendarPlus, 
  Check, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

export default function Home() {
  // Estados para almacenar los datos
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);
  
  // Estados para manejar la UI
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para mostrar u ocultar los modales
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  // Carga inicial de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [weatherData, planesData] = await Promise.all([
          getCiudadClima(1), 
          getPlanes(1)       
        ]);
        setWeather(weatherData);
        setPlanes(planesData);
      } catch (err) {
        setError('Error al conectar con el servidor. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lógica que cruza BD con API (Regla de negocio)
  const evaluarPlan = (plan: Plan, climaActual: WeatherData) => {
    if (climaActual.condition === 'Rain' && plan.clima_esperado === 'Clear') {
      return (
        <div className="flex items-center text-amber-700 bg-amber-50 p-3 rounded-xl mb-4 border border-amber-100">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">Advertencia: Lluvia pronosticada. Tu actividad podría arruinarse.</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-xl mb-4 border border-green-100">
        <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
        <span className="text-sm font-medium">¡Clima ideal para esta actividad!</span>
      </div>
    );
  };

  // PANTALLA: CARGANDO
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Cargando tu planificador...</p>
      </div>
    );
  }

  // PANTALLA: ERROR
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl text-center shadow-xl border border-red-100 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">¡Ups! Algo salió mal</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // PANTALLA: PRINCIPAL (SUCCESS)
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      
      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* Controles Principales */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
            <MapPin className="text-blue-500 w-5 h-5" />
            <select className="bg-transparent text-slate-800 font-semibold outline-none cursor-pointer w-full">
              <option>Tuxtla Gutiérrez, MX</option>
              <option>Ciudad de México, MX</option>
            </select>
          </div>
          
          <div className="flex space-x-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowCityModal(true)} 
              className="flex-1 sm:flex-none px-5 py-3 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
            >
              + Ciudad
            </button>
            <button 
              onClick={() => setShowPlanModal(true)} 
              className="flex-1 sm:flex-none px-5 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition inline-flex items-center justify-center"
            >
              <CalendarPlus className="w-5 h-5 mr-2" /> 
              Crear Plan
            </button>
          </div>
        </div>

        {/* Tarjeta del Clima Actual */}
        {weather && (
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center">
            <div className="relative z-10">
              <h2 className="text-lg font-medium text-blue-100 mb-1">Clima Actual</h2>
              <div className="text-6xl md:text-7xl font-extrabold my-2 tracking-tight">{weather.temp}°</div>
              <p className="text-xl md:text-2xl font-medium capitalize text-blue-50">{weather.description}</p>
            </div>
            <div className="relative z-10">
              {weather.condition === 'Rain' ? (
                <CloudRain className="w-32 h-32 md:w-40 md:h-40 text-white drop-shadow-lg" />
              ) : (
                <Sun className="w-32 h-32 md:w-40 md:h-40 text-yellow-300 drop-shadow-lg" />
              )}
            </div>
            {/* Círculos decorativos de fondo */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-blue-900 opacity-20 blur-xl"></div>
          </section>
        )}

        {/* Lista de Planes */}
        <section>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Tus Próximos Planes</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {planes.map((plan) => (
              <div key={plan.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">{plan.actividad}</h3>
                    <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg">
                      {plan.fecha}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-5 font-medium">📝 {plan.notas}</p>
                  
                  {weather && evaluarPlan(plan, weather)}
                </div>

                <div className="flex space-x-3 pt-4 border-t border-slate-100 mt-auto">
                  <button className="flex-1 flex items-center justify-center py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition">
                    <Check className="w-4 h-4 mr-1.5" /> Completar
                  </button>
                  <button className="flex-1 flex items-center justify-center py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition">
                    <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= MODALES ================= */}
        
        {/* Modal: Registrar Ciudad */}
        {showCityModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setShowCityModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="font-extrabold text-2xl mb-6 text-slate-800">Nueva Ciudad</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de la ciudad</label>
                  <input type="text" placeholder="Ej: Tuxtla Gutiérrez" className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Código de país</label>
                  <input type="text" placeholder="Ej: MX" className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition uppercase" maxLength={2} />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button onClick={() => setShowCityModal(false)} className="px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancelar</button>
                <button className="px-5 py-3 font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition">Guardar Ciudad</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Crear Plan */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setShowPlanModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="font-extrabold text-2xl mb-6 text-slate-800">Crear Nuevo Plan</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Actividad</label>
                  <input type="text" placeholder="Ej: Jugar fútbol" className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
                  <input type="date" className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Notas adicionales</label>
                  <textarea placeholder="Llevar agua, invitar amigos..." className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition h-28 resize-none"></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button onClick={() => setShowPlanModal(false)} className="px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancelar</button>
                <button className="px-5 py-3 font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition">Guardar Plan</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}