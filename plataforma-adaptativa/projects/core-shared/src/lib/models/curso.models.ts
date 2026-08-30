export interface Curso {
  id: string;
  colegio_id: string;
  profesor_id: string;
  nombre: string;
  materia: string;
  grado: string;
  seccion: string;
  ciclo: number;
  codigo_acceso: string;
  aula_filas: number;
  aula_columnas: number;
  grafo_aprobado: boolean;
  activo: boolean;
}
