export interface Restaurante {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  latitud?: number;
  longitud?: number;
  lat?: number; // Compatibilidad legacy
  lng?: number; // Compatibilidad legacy
  imagenUrl?: string;
}

export interface Promocion {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  fechaExpiracion: Date;
}