import { Component, inject } from '@angular/core';
import { AuthService } from 'core-shared';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard-layout">
      <header class="topbar">
        <div class="brand">
          <span class="icon" aria-hidden="true">🏫</span>
          <span class="title">Colegio Demo &bull; <strong>Panel Administrador</strong></span>
        </div>
        <div class="user-meta">
          <div class="user-info">
            <span class="name">{{ auth.currentUser()?.nombre }} {{ auth.currentUser()?.apellido }}</span>
            <span class="badge badge-admin">Administrador</span>
          </div>
          <button class="logout-btn" (click)="auth.logout()">Cerrar Sesión</button>
        </div>
      </header>
      <main class="content">
        <div class="welcome-card">
          <h1>¡Bienvenida, {{ auth.currentUser()?.nombre }}! 👋</h1>
          <p class="subtitle">
            Panel de Control Institucional y Configuración de Ciclo 2026.
          </p>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-num">1</div>
              <div class="stat-label">Colegios Activos</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">13</div>
              <div class="stat-label">Usuarios Registrados</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">1</div>
              <div class="stat-label">Cursos Creados</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">8</div>
              <div class="stat-label">Nodos de Grafo</div>
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
    .badge-admin { background: rgba(244, 63, 94, 0.2); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
    .logout-btn { background: #e11d48; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; transition: background 0.2s; }
    .logout-btn:hover { background: #be123c; }
    .content { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .welcome-card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; border: 1px solid rgba(255,255,255,0.1); }
    .welcome-card h1 { margin: 0 0 0.5rem; font-size: 1.75rem; }
    .subtitle { color: #94a3b8; margin-bottom: 2rem; font-size: 1rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25rem; }
    .stat-card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); padding: 1.5rem; border-radius: 0.85rem; text-align: center; }
    .stat-num { font-size: 2rem; font-weight: 700; color: #38bdf8; }
    .stat-label { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }
  `]
})
export class AdminDashboardComponent {
  readonly auth = inject(AuthService);
}
