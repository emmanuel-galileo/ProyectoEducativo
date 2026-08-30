import { Component, inject } from '@angular/core';
import { AuthService } from 'core-shared';

@Component({
  selector: 'app-profesor-dashboard',
  template: `
    <div class="dashboard-layout">
      <header class="topbar">
        <div class="brand">
          <span class="icon" aria-hidden="true">📚</span>
          <span class="title">Colegio Demo &bull; <strong>Portal Docente</strong></span>
        </div>
        <div class="user-meta">
          <div class="user-info">
            <span class="name">Prof. {{ auth.currentUser()?.nombre }} {{ auth.currentUser()?.apellido }}</span>
            <span class="badge badge-profesor">Docente</span>
          </div>
          <button class="logout-btn" (click)="auth.logout()">Cerrar Sesión</button>
        </div>
      </header>
      <main class="content">
        <div class="welcome-card">
          <h1>¡Hola, Prof. {{ auth.currentUser()?.nombre }}! 👩‍🏫</h1>
          <p class="subtitle">
            Gestión de Aulas, Grafo Curricular, Diagnósticos y Asignación de Rutas Adaptativas.
          </p>
          <div class="courses-section">
            <h2>Tus Cursos Asignados</h2>
            <div class="course-card">
              <div class="course-header">
                <span class="badge-materia">Matemáticas</span>
                <span class="code">Código: MAT-3B</span>
              </div>
              <h3>Matemática Adaptativa - 3ro Primaria B</h3>
              <p>10 Alumnos Inscritos &bull; 8 Temas Curriculares &bull; Grafo Activo</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { min-height: 100vh; background: #0b1329; color: #f8fafc; font-family: system-ui, sans-serif; }
    .topbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #152243; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .brand { display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; }
    .user-meta { display: flex; gap: 1.5rem; align-items: center; }
    .user-info { display: flex; flex-direction: column; align-items: flex-end; }
    .name { font-weight: 600; font-size: 0.9rem; }
    .badge { font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 9999px; font-weight: 600; }
    .badge-profesor { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .logout-btn { background: #e11d48; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; transition: background 0.2s; }
    .logout-btn:hover { background: #be123c; }
    .content { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .welcome-card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; border: 1px solid rgba(255,255,255,0.1); }
    .welcome-card h1 { margin: 0 0 0.5rem; font-size: 1.75rem; }
    .subtitle { color: #94a3b8; margin-bottom: 2rem; font-size: 1rem; }
    .courses-section h2 { font-size: 1.25rem; margin-bottom: 1rem; }
    .course-card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 0.85rem; }
    .course-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.8rem; color: #94a3b8; }
    .badge-materia { background: #3b82f6; color: #fff; padding: 0.2rem 0.5rem; border-radius: 0.35rem; font-weight: 600; }
    .course-card h3 { margin: 0.25rem 0 0.5rem; font-size: 1.15rem; }
    .course-card p { margin: 0; color: #94a3b8; font-size: 0.9rem; }
  `]
})
export class ProfesorDashboardComponent {
  readonly auth = inject(AuthService);
}
