'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  getCiudadClima,
  getCiudades,
  createCiudad,
  getPlanes,
  createPlan,
  updatePlan,
  deletePlan,
  getApiErrorMessage,
} from '@/services/api';
import { useToast } from '@/components/ToastProvider';
import { Plan, Ciudad, WeatherData } from '@/types';
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
  Droplet,
  NotebookPen,
  X,
  ChevronDown
} from 'lucide-react';

const CLIMA_OPCIONES = [
  { value: 'Clear', label: 'Despejado' },
  { value: 'Clouds', label: 'Nublado' },
  { value: 'Rain', label: 'Lluvia' },
  { value: 'Thunderstorm', label: 'Tormenta' },
  { value: 'Snow', label: 'Nieve' },
];

const CLIMA_ADVERSO: WeatherData['condition'][] = ['Rain', 'Thunderstorm', 'Snow'];

export default function Home() {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [selectedCiudadId, setSelectedCiudadId] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  const [cityNombre, setCityNombre] = useState('');
  const [cityEstado, setCityEstado] = useState('');
  const [cityCodigoPais, setCityCodigoPais] = useState('');
  const [cityCodigoPostal, setCityCodigoPostal] = useState('');
  const [citySubmitting, setCitySubmitting] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);

  const [planActividad, setPlanActividad] = useState('');
  const [planFecha, setPlanFecha] = useState('');
  const [planNotas, setPlanNotas] = useState('');
  const [planClima, setPlanClima] = useState('Clear');
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [planToComplete, setPlanToComplete] = useState<Plan | null>(null);
  const [completing, setCompleting] = useState(false);

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchCiudades = async () => {
      try {
        setLoading(true);
        setError(null);
        const inicio = Date.now();
        const data = await getCiudades();

        // Tiempo mínimo de carga para que el spinner sea visible,
        // aunque la API responda muy rápido.
        const TIEMPO_MINIMO_MS = 4000;
        const transcurrido = Date.now() - inicio;
        if (transcurrido < TIEMPO_MINIMO_MS) {
          await new Promise((resolve) => setTimeout(resolve, TIEMPO_MINIMO_MS - transcurrido));
        }

        setCiudades(data);
        if (data.length > 0) setSelectedCiudadId(data[0].id);
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        toast.error('No se pudieron cargar tus ciudades', msg);
      } finally {
        setLoading(false);
      }
    };
    fetchCiudades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCiudadId == null) return;

    let cancelado = false;

    const fetchCiudadData = async () => {
      try {
        setError(null);

        let weatherFallo = false;
        const weatherPromise = getCiudadClima(selectedCiudadId).catch(() => {
          weatherFallo = true;
          return null;
        });
        const [weatherData, planesData] = await Promise.all([
          weatherPromise,
          getPlanes(selectedCiudadId),
        ]);
        if (!cancelado) {
          setWeather(weatherData);
          setPlanes(planesData);

          if (weatherFallo) {
            toast.warning('No se pudo obtener el clima actual', 'Mostrando la ciudad sin datos meteorológicos.');
          } else if (weatherData && CLIMA_ADVERSO.includes(weatherData.condition)) {
            toast.warning(
              `Clima adverso en ${ciudades.find((c) => c.id === selectedCiudadId)?.nombre ?? 'tu ciudad'}`,
              `${weatherData.description} — revisa tus planes próximos.`
            );
          }
        }
      } catch (err) {
        if (!cancelado) {
          const msg = getApiErrorMessage(err);
          setError(msg);
          toast.error('Error al cargar la ciudad', msg);
        }
      }
    };

    fetchCiudadData();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCiudadId]);

  const PALABRAS_CLIMA_ADVERSO = ['lluvia', 'tormenta', 'nieve', 'granizo'];

  const evaluarPlan = (plan: Plan) => {
    if (!plan.climaEsperado) {
      return (
        <div className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">Clima pendiente por confirmar.</span>
        </div>
      );
    }

    const textoClima = plan.climaEsperado.toLowerCase();
    const esAdverso = PALABRAS_CLIMA_ADVERSO.some((palabra) => textoClima.includes(palabra));

    if (esAdverso) {
      return (
        <div className="flex items-center text-amber-700 bg-amber-50 p-3 rounded-xl mb-4 border border-amber-100">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">Advertencia: {plan.climaEsperado}. Tu actividad podría verse afectada.</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-xl mb-4 border border-green-100">
        <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
        <span className="text-sm font-medium">¡Clima ideal! {plan.climaEsperado}</span>
      </div>
    );
  };

  const handleSaveCity = async () => {
    setCityError(null);
    if (!cityNombre.trim() || cityCodigoPais.trim().length !== 2) {
      setCityError('Nombre y código de país (2 letras) son obligatorios.');
      return;
    }
    setCitySubmitting(true);
    try {
      const nueva = await createCiudad({
        nombre: cityNombre.trim(),
        estado: cityEstado.trim() || undefined,
        codigoPais: cityCodigoPais.trim().toUpperCase(),
        codigoPostal: cityCodigoPostal.trim() || undefined,
      });
      setCiudades((prev) => [...prev, nueva]);
      setSelectedCiudadId(nueva.id);
      setCityNombre('');
      setCityEstado('');
      setCityCodigoPais('');
      setCityCodigoPostal('');
      setShowCityModal(false);
      toast.success('Ciudad agregada', `${nueva.nombre} ya está en tu lista.`);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setCityError(msg);
      toast.error('No se pudo guardar la ciudad', msg);
    } finally {
      setCitySubmitting(false);
    }
  };

  const handleSavePlan = async () => {
    setPlanError(null);
    if (selectedCiudadId == null) {
      setPlanError('Selecciona o crea una ciudad primero.');
      return;
    }
    if (!planActividad.trim()) {
      setPlanError('La actividad es obligatoria.');
      return;
    }
    setPlanSubmitting(true);
    try {
      const nuevo = await createPlan({
        idCiudad: selectedCiudadId,
        actividad: planActividad.trim(),
        fecha: planFecha || undefined,
        notas: planNotas.trim() || undefined,
        climaEsperado: planClima,
      });
      setPlanes((prev) => [...prev, nuevo]);
      setPlanActividad('');
      setPlanFecha('');
      setPlanNotas('');
      setPlanClima('Clear');
      setShowPlanModal(false);
      toast.success('Plan creado', `"${nuevo.actividad}" se agregó a tu lista.`);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setPlanError(msg);
      toast.error('No se pudo crear el plan', msg);
    } finally {
      setPlanSubmitting(false);
    }
  };

  const handleCompletarPlan = (id: number) => {
    const plan = planes.find((p) => p.id === id) ?? null;
    setPlanToComplete(plan);
  };

  const confirmCompletePlan = async () => {
    if (!planToComplete) return;
    setCompleting(true);
    try {
      const actualizado = await updatePlan(planToComplete.id, { completado: true });
      setPlanes((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
      toast.success('¡Plan completado!', `"${actualizado.actividad}" quedó marcado como hecho.`);
      setPlanToComplete(null);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error('No se pudo completar el plan', msg);
    } finally {
      setCompleting(false);
    }
  };

  const handleEliminarPlan = (id: number) => {
    const plan = planes.find((p) => p.id === id) ?? null;
    setPlanToDelete(plan);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    setDeleting(true);
    try {
      await deletePlan(planToDelete.id);
      setPlanes((prev) => prev.filter((p) => p.id !== planToDelete.id));
      toast.info('Plan eliminado', `"${planToDelete.actividad}" se quitó de tu lista.`);
      setPlanToDelete(null);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error('No se pudo eliminar el plan', msg);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Cargando tu planificador...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl text-center shadow-xl border border-red-100 max-w-md">
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

  const ciudadActual = ciudades.find((c) => c.id === selectedCiudadId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      
      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 gap-4">
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setCityDropdownOpen((v) => !v)}
              disabled={ciudades.length === 0}
              className="flex items-center gap-3 w-full sm:w-auto bg-white p-3 rounded-full border border-slate-200 hover:border-slate-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <MapPin className="text-teal-500 w-5 h-5 flex-shrink-0" />
              <span className="text-slate-800 font-semibold truncate">
                {ciudadActual ? `${ciudadActual.nombre}, ${ciudadActual.codigoPais}` : 'Sin ciudades registradas'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-auto sm:ml-1 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {cityDropdownOpen && ciudades.length > 0 && (
              <>
                {/* Overlay invisible para cerrar el dropdown al hacer click afuera */}
                <div className="fixed inset-0 z-10" onClick={() => setCityDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-2 w-full sm:w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-20 max-h-64 overflow-y-auto">
                  {ciudades.map((c) => {
                    const activa = c.id === selectedCiudadId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCiudadId(c.id);
                          setCityDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between text-left px-4 py-2.5 text-sm font-medium transition ${
                          activa ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{c.nombre}, {c.codigoPais}</span>
                        {activa && <Check className="w-4 h-4 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          
          <div className="flex space-x-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowCityModal(true)} 
              className="flex-1 sm:flex-none px-5 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition"
            >
              + Ciudad
            </button>
            <button 
              onClick={() => setShowPlanModal(true)} 
              disabled={selectedCiudadId == null}
              className="flex-1 sm:flex-none px-5 py-3 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transition inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CalendarPlus className="w-5 h-5 mr-2" /> 
              Crear plan
            </button>
          </div>
        </div>

        {weather && ciudadActual && (
          <section className="relative overflow-hidden bg-gradient-to-br from-sky-200 via-sky-100 to-blue-100 rounded-3xl p-8 text-slate-900 shadow-sm border border-sky-100 min-h-[260px] flex items-center">
            <svg
              className="absolute bottom-0 left-0 w-full h-40 opacity-70"
              viewBox="0 0 800 200"
              preserveAspectRatio="none"
            >
              <path d="M0,200 L0,140 C150,60 300,180 450,90 C580,20 680,110 800,60 L800,200 Z" fill="#bcdcf5" />
            </svg>

            <CloudRain className="absolute top-10 right-40 w-16 h-16 text-white/70 hidden md:block" />

            <div className="relative z-10 max-w-md">
              <p className="text-xs font-bold tracking-widest text-slate-500 mb-3 uppercase">
                Estación · {ciudadActual.nombre}, {ciudadActual.codigoPais}
              </p>
              <div className="text-6xl md:text-7xl font-extrabold my-1 tracking-tight text-slate-900">{weather.temp}°</div>
              <p className="text-xl text-slate-700 mb-4">{weather.description}</p>
              {weather.humidity != null && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{weather.humidity}%</span>
                </div>
              )}
            </div>

            <div className="relative z-10 ml-auto hidden md:block">
              {weather.condition === 'Rain' ? (
                <CloudRain className="w-36 h-36 text-white drop-shadow-md" strokeWidth={1.5} />
              ) : (
                <Sun className="w-36 h-36 text-amber-300 drop-shadow-md" strokeWidth={1.5} />
              )}
            </div>
          </section>
        )}

        {ciudades.length === 0 && (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
            Aún no tienes ciudades registradas. Usa <span className="font-semibold text-slate-700">+ Ciudad</span> para agregar la primera.
          </div>
        )}

        {ciudades.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Tus Próximos Planes</h2>
            {planes.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
                No tienes planes para esta ciudad todavía.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {planes.map((plan) => (
                  <div key={plan.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-slate-800 leading-tight">{plan.actividad}</h3>
                        {plan.fecha && (
                          <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg">
                            {plan.fecha.slice(0, 10)}
                          </span>
                        )}
                      </div>
                      {plan.notas && (
                        <p className="text-slate-500 text-sm mb-5 font-medium flex items-center gap-1.5">
                          <NotebookPen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          {plan.notas}
                        </p>
                      )}

                      {evaluarPlan(plan)}
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-slate-100 mt-auto">
                      <button
                        onClick={() => handleCompletarPlan(plan.id)}
                        disabled={plan.completado}
                        className="flex-1 flex items-center justify-center py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4 mr-1.5" /> {plan.completado ? 'Completado' : 'Completar'}
                      </button>
                      <button
                        onClick={() => handleEliminarPlan(plan.id)}
                        className="flex-1 flex items-center justify-center py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {showCityModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setShowCityModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="font-extrabold text-2xl mb-6 text-slate-800">Nueva Ciudad</h3>

              {cityError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                  {cityError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de la ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej: Tuxtla Gutiérrez"
                    maxLength={100}
                    value={cityNombre}
                    onChange={(e) => setCityNombre(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Estado (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Chiapas"
                    maxLength={100}
                    value={cityEstado}
                    onChange={(e) => setCityEstado(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Código de país</label>
                  <input
                    type="text"
                    placeholder="Ej: MX"
                    maxLength={2}
                    value={cityCodigoPais}
                    onChange={(e) => setCityCodigoPais(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Código postal (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: 29000"
                    maxLength={10}
                    value={cityCodigoPostal}
                    onChange={(e) => setCityCodigoPostal(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button onClick={() => setShowCityModal(false)} className="px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancelar</button>
                <button
                  onClick={handleSaveCity}
                  disabled={citySubmitting}
                  className="px-5 py-3 font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {citySubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar Ciudad
                </button>
              </div>
            </div>
          </div>
        )}

        {showPlanModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button onClick={() => setShowPlanModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="font-extrabold text-2xl mb-6 text-slate-800">Crear Nuevo Plan</h3>

              {planError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                  {planError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Actividad</label>
                  <input
                    type="text"
                    placeholder="Ej: Jugar fútbol"
                    maxLength={100}
                    value={planActividad}
                    onChange={(e) => setPlanActividad(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={planFecha}
                    onChange={(e) => setPlanFecha(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Clima esperado</label>
                  <select
                    value={planClima}
                    onChange={(e) => setPlanClima(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  >
                    {CLIMA_OPCIONES.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Notas adicionales</label>
                  <textarea
                    placeholder="Llevar agua, invitar amigos..."
                    maxLength={100}
                    value={planNotas}
                    onChange={(e) => setPlanNotas(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition h-28 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button onClick={() => setShowPlanModal(false)} className="px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancelar</button>
                <button
                  onClick={handleSavePlan}
                  disabled={planSubmitting}
                  className="px-5 py-3 font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {planSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {planToComplete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 mx-auto mb-5">
                <Check className="w-7 h-7 text-green-600" />
              </div>

              <h3 className="font-extrabold text-xl mb-2 text-slate-800 text-center">
                ¿Marcar como completado?
              </h3>
              <p className="text-slate-500 text-center mb-8">
                &quot;{planToComplete.actividad}&quot; se marcará como completado.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setPlanToComplete(null)}
                  disabled={completing}
                  className="flex-1 px-5 py-3 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmCompletePlan}
                  disabled={completing}
                  className="flex-1 px-5 py-3 font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {completing && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sí, completar
                </button>
              </div>
            </div>
          </div>
        )}

        {planToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mx-auto mb-5">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>

              <h3 className="font-extrabold text-xl mb-2 text-slate-800 text-center">
                ¿Eliminar este plan?
              </h3>
              <p className="text-slate-500 text-center mb-8">
                &quot;{planToDelete.actividad}&quot; se eliminará permanentemente. Esta acción no se puede deshacer.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setPlanToDelete(null)}
                  disabled={deleting}
                  className="flex-1 px-5 py-3 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeletePlan}
                  disabled={deleting}
                  className="flex-1 px-5 py-3 font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}