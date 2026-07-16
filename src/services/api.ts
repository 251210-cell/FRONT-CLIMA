import axios from 'axios';
import { Plan, WeatherData } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Simulaciones asíncronas para cumplir la rúbrica mientras hacemos el backend
export const getCiudadClima = async (ciudadId: number): Promise<WeatherData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ temp: 24, description: 'Lluvia ligera', condition: 'Rain' });
    }, 1500); 
  });
};

export const getPlanes = async (usuarioId: number): Promise<Plan[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1, id_usuario: usuarioId, id_ciudad: 1, fecha: '2026-07-20',
          actividad: 'Correr en el parque', notas: 'Llevar agua',
          completado: false, clima_esperado: 'Clear'
        },
        {
          id: 2, id_usuario: usuarioId, id_ciudad: 1, fecha: '2026-07-21',
          actividad: 'Maratón de películas', notas: 'Comprar palomitas',
          completado: false, clima_esperado: 'Rain'
        }
      ]);
    }, 1500);
  });
};