import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService, CursoService, Curso } from 'core-shared';

@Component({
  selector: 'app-detalle-clase',
  imports: [RouterLink],
  templateUrl: './detalle-clase.component.html',
  styleUrl: './detalle-clase.component.scss',
})
export class DetalleClaseComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  readonly cursoService = inject(CursoService);

  curso = signal<Curso | null>(null);
  selectedFileName = signal<string | null>(null);

  ngOnInit(): void {
    const cursoId = this.route.snapshot.paramMap.get('id');
    if (cursoId) {
      this.cursoService.obtenerCursoPorId(cursoId).subscribe({
        next: (data) => this.curso.set(data),
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileName.set(input.files[0].name);
    }
  }
}
