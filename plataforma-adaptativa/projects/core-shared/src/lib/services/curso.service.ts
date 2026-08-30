import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Curso } from '../models/curso.models';

@Injectable({
  providedIn: 'root',
})
export class CursoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/v1';

  readonly cursos = signal<Curso[]>([]);
  readonly cursoSeleccionado = signal<Curso | null>(null);
  readonly isLoading = signal<boolean>(false);

  obtenerCursosPorProfesor(profesorId: string): Observable<Curso[]> {
    this.isLoading.set(true);
    return this.http
      .get<Curso[]>(`${this.apiUrl}/profesores/${profesorId}/cursos`)
      .pipe(
        tap({
          next: (data) => {
            this.cursos.set(data);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
          },
        })
      );
  }

  obtenerCursoPorId(cursoId: string): Observable<Curso> {
    this.isLoading.set(true);
    return this.http.get<Curso>(`${this.apiUrl}/cursos/${cursoId}`).pipe(
      tap({
        next: (data) => {
          this.cursoSeleccionado.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      })
    );
  }
}
