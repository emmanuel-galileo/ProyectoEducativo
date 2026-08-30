import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService, CursoService } from 'core-shared';

@Component({
  selector: 'app-mis-clases',
  imports: [RouterLink],
  templateUrl: './mis-clases.component.html',
  styleUrl: './mis-clases.component.scss',
})
export class MisClasesComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly cursoService = inject(CursoService);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user?.id) {
      this.cursoService.obtenerCursosPorProfesor(user.id).subscribe();
    }
  }
}
