export type Rol = 'admin' | 'profesor' | 'alumno' | 'padre';

export type EstadoTema = 'dominado' | 'en_progreso' | 'refuerzo' | 'bloqueado';

export interface TemaGrafo {
  id: string;
  nombre: string;
  prerrequisitos: string[];
  estado: EstadoTema;
  orden: number;
}

export interface AlumnoAula {
  id: string;
  nombre: string;
  fila: number;
  columna: number;
  dominioGeneral: number; // 0 a 100
  estado: EstadoTema;
  temaDetenido?: string;
}

export interface RecomendacionPadre {
  tema: string;
  banda: 'Domina' | 'En desarrollo' | 'Necesita refuerzo';
  accionSugerida: string;
}
