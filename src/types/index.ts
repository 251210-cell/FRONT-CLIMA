export interface Usuario {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ciudad {
  id: number;
  idUsuario: number;
  nombre: string;
  estado?: string | null;
  codigoPais: string;
  codigoPostal?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ClimaEsperado = 'Clear' | 'Rain' | 'Clouds' | 'Snow' | 'Thunderstorm';

export interface Plan {
  id: number;
  idUsuario: number;
  idCiudad: number;
  fecha?: string | null;
  actividad: string;
  notas?: string | null;
  completado: boolean;
  climaEsperado?: ClimaEsperado | string | null;
  createdAt?: string;
  updatedAt?: string;
}


export interface WeatherData {
  temp: number;
  description: string;
  condition: 'Clear' | 'Rain' | 'Clouds' | 'Snow' | 'Thunderstorm';
  humidity?: number;
}


export interface ApiResponse<T> {
  code: number;
  message: string;
  detail: string;
  data: T;
}

export interface ApiErrorBody {
  code: number;
  message: string;
  detail: string;
}