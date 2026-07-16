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
  AlertCircle 
} from 'lucide-react';

export default function Home() {
  // Estados para almacenar los datos
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);
  
  // Estados para manejar la UI (Loading, Error)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para mostrar u ocultar los modales
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  // Efecto para cargar los datos al iniciar la pantalla
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Peticiones asíncronas concurrentes (Fase 3 de tu rúbrica)
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

  // Función de evaluación de negocio (Cruza el clima actual con el plan)
  const evaluarPlan = (plan: Plan, climaActual: WeatherData) => {
    if (climaActual.condition === 'Rain' && plan.clima_esperado === 'Clear') {
      return (
        <div className="flex items-center text-amber-600 bg-amber-50 p-2 rounded-md mb-4">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span className="text-xs font-medium">Advertencia: Lluvia pronosticada.</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-green-600 bg-green-50 p-2 rounded-md mb-4">
        <CheckCircle2 className="w-4 h-4 mr-2" />
        <span className="text-xs font-medium">¡Clima ideal para esta actividad!</span>
      </div>
    );
  };

  // ESTADO: LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // ESTADO: ERROR
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-red-50 p-6 rounded-lg text-center border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  // ESTADO: SUCCESS (Renderizado principal)
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto p-8 space-y-8">
        
        {/* Barra de Controles Principales */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2">
            <MapPin className="text-slate-400" />
            <select className="bg-transparent text-slate-800 font-medium outline-none cursor-pointer">
              <option>Tuxtla Gutiérrez, MX</option>
            </select>
          </div>
          <div className="space-x-3">
            <button 
              onClick={() => setShowCityModal(true)} 
              className="px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              + Nueva Ciudad
            </button>
            <button 
              onClick={() => setShowPlanModal(true)} 
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
            >
              <CalendarPlus className="w-4 h-4 mr-2" /> 
              Crear Plan
            </button>
          </div>
        </div>

        {/* Tarjeta del Clima */}
        {weather && (
          <section className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
            <div>
              <h2 className="text-xl font-medium opacity-90">Clima Actual</h2>
              <div className="text-5xl font-bold my-2">{weather.temp}°C</div>
              <p className="text-lg capitalize">{weather.description}</p>
            </div>
            {weather.condition === 'Rain' ? (
              <CloudRain className="w-24 h-24 opacity-80" />
            ) : (
              <Sun className="w-24 h-24 opacity-80" />
            )}
          </section>
        )}

        {/* Lista de Planes Interactiva */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tus Planes Guardados</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {planes.map((plan) => (
              <div key={plan.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-800">{plan.actividad}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                    {plan.fecha}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mb-4">Notas: {plan.notas}</p>
                
                {/* Lógica que cruza BD con API */}
                {weather && evaluarPlan(plan, weather)}

                {/* Botones de acción ocultos hasta hacer hover */}
                <div className="flex space-x-2 border-t pt-3 mt-2 border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 flex items-center justify-center py-1.5 text-sm text-green-600 bg-green-50 rounded hover:bg-green-100 transition">
                    <Check className="w-4 h-4 mr-1" /> Completar
                  </button>
                  <button className="flex-1 flex items-center justify-center py-1.5 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 transition">
                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modal: Registrar Ciudad */}
        {showCityModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
              <h3 className="font-bold text-lg mb-4 text-slate-800">Registrar Nueva Ciudad</h3>
              <input type="text" placeholder="Nombre de la ciudad" className="w-full p-2 border border-slate-200 rounded mb-3 outline-none focus:border-blue-500" />
              <input type="text" placeholder="Código de país (Ej: MX)" className="w-full p-2 border border-slate-200 rounded mb-4 outline-none focus:border-blue-500" />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowCityModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition">Cancelar</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Crear Plan */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
              <h3 className="font-bold text-lg mb-4 text-slate-800">Crear Nuevo Plan</h3>
              <input type="text" placeholder="Actividad" className="w-full p-2 border border-slate-200 rounded mb-3 outline-none focus:border-blue-500" />
              <input type="date" className="w-full p-2 border border-slate-200 rounded mb-3 outline-none focus:border-blue-500" />
              <textarea placeholder="Notas" className="w-full p-2 border border-slate-200 rounded mb-4 outline-none focus:border-blue-500 h-24 resize-none"></textarea>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition">Cancelar</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Guardar Plan</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}