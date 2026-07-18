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
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'https://awospoyec2-production.up.railway.app/api/v1',
  withCredentials: true,
});

// ================= TOKEN STORAGE =================

const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// Adjunta el token guardado como Authorization header en cada petición
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ================= USER STORAGE =================

const USER_KEY = 'auth_user';

export const getStoredUsuario = (): Usuario | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

const setStoredUsuario = (usuario: Usuario) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
};

const clearStoredUsuario = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
};

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
  const res = await api.post<ApiResponse<{ token: string; usuario: Usuario }>>('/auth/login', data);
  const { token, usuario } = res.data.data;
  setToken(token);
  setStoredUsuario(usuario);
  return usuario;
};

export const authLogout = async () => {
  try {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/logout', {});
    return res.data.data;
  } finally {
    clearToken();
    clearStoredUsuario();
  }
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

export const getCiudadClima = async (idCiudad: number): Promise<WeatherData> => {
  const res = await api.get<ApiResponse<WeatherData>>(`/ciudades/${idCiudad}/clima-actual`);
  return res.data.data;
};

export default api;