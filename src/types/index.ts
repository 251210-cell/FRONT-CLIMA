export interface Usuario {
    id: number;
    name: string;
    email: string;
  }
  
  export interface Ciudad {
    id: number;
    id_usuario: number;
    nombre: string;
    estado: string;
    codigo_pais: string;
  }
  
  export interface Plan {
    id: number;
    id_usuario: number;
    id_ciudad: number;
    fecha: string;
    actividad: string;
    notas: string;
    completado: boolean;
    clima_esperado: string; 
  }
  
  export interface WeatherData {
    temp: number;
    description: string;
    condition: 'Clear' | 'Rain' | 'Clouds' | 'Snow' | 'Thunderstorm';
    humidity?: number;
  }