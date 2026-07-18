import axios, { AxiosError } from 'axios';
import {
  Usuario,
  Ciudad,
  Plan,
  WeatherData,
  ApiResponse,
  ApiErrorBody,
} from '../types';

const api = axios.create({
  // Agregamos /api/v1 al final de la URL por defecto
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'https://awospoyec2-production.up.railway.app/api/v1',
  withCredentials: true, 
});
// Normaliza los errores del backend ({ code, message, detail }) a un mensaje legible
export const getApiErrorMessage = (err: unknown): string => {
  const axiosErr = err as AxiosError<ApiErrorBody>;
  return axiosErr.response?.data?.detail ?? 'Error al conectar con el servidor. Intenta de nuevo.';
};

// ================= AUTH =================

export const authRegister = async (data: { name: string; email: string; password: string }) => {
  const res = await api.post<ApiResponse<Usuario>>('/auth/register', data);
  return res.data.data;
};

export const authLogin = async (data: { email: string; password: string }) => {
  const res = await api.post<ApiResponse<{ usuario: Usuario }>>('/auth/login', data);
  return res.data.data.usuario;
};

export const authLogout = async () => {
  const res = await api.post<ApiResponse<{ message: string }>>('/auth/logout', {});
  return res.data.data;
};

// ================= USERS =================

export const updateUsuario = async (id: number, data: Partial<{ name: string; email: string; password: string }>) => {
  const res = await api.put<ApiResponse<Usuario>>(`/users/${id}`, data);
  return res.data.data;
};

export const deleteUsuario = async (id: number) => {
  const res = await api.delete<ApiResponse<{ message: string }>>(`/users/${id}`);
  return res.data.data;
};

// ================= CIUDADES =================

export const getCiudades = async (): Promise<Ciudad[]> => {
  const res = await api.get<ApiResponse<Ciudad[]>>('/ciudades');
  return res.data.data;
};

export const createCiudad = async (data: {
  nombre: string;
  estado?: string;
  codigoPais: string;
  codigoPostal?: string;
}): Promise<Ciudad> => {
  const res = await api.post<ApiResponse<Ciudad>>('/ciudades', data);
  return res.data.data;
};

export const updateCiudad = async (id: number, data: Partial<{
  nombre: string;
  estado: string;
  codigoPais: string;
  codigoPostal: string;
}>): Promise<Ciudad> => {
  const res = await api.put<ApiResponse<Ciudad>>(`/ciudades/${id}`, data);
  return res.data.data;
};

export const deleteCiudad = async (id: number) => {
  const res = await api.delete<ApiResponse<null>>(`/ciudades/${id}`);
  return res.data;
};

// ================= PLANES =================

export const getPlanes = async (idCiudad?: number): Promise<Plan[]> => {
  const res = await api.get<ApiResponse<Plan[]>>('/planes', {
    params: idCiudad ? { idCiudad } : undefined,
  });
  return res.data.data;
};

export const createPlan = async (data: {
  idCiudad: number;
  actividad: string;
  fecha?: string;
  notas?: string;
  completado?: boolean;
  climaEsperado?: string;
}): Promise<Plan> => {
  const res = await api.post<ApiResponse<Plan>>('/planes', data);
  return res.data.data;
};

export const updatePlan = async (id: number, data: Partial<{
  idCiudad: number;
  actividad: string;
  fecha: string;
  notas: string;
  completado: boolean;
  climaEsperado: string;
}>): Promise<Plan> => {
  const res = await api.put<ApiResponse<Plan>>(`/planes/${id}`, data);
  return res.data.data;
};

export const deletePlan = async (id: number) => {
  const res = await api.delete<ApiResponse<null>>(`/planes/${id}`);
  return res.data;
};

// ================= CLIMA =================
// El backend todavía no tiene endpoint de clima (no existe /api/v1/clima).
// Se deja simulado a propósito hasta que se implemente esa ruta.
export const getCiudadClima = async (_idCiudad: number): Promise<WeatherData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ temp: 24, description: 'Lluvia ligera', condition: 'Rain', humidity: 68 });
    }, 800);
  });
};

export default api;
