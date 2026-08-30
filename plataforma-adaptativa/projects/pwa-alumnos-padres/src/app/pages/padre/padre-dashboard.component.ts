import { Component, inject } from '@angular/core';
import { AuthService } from 'core-shared';

@Component({
  selector: 'app-padre-dashboard',
  template: `
    <div class="pwa-layout">
      <header class="pwa-header">
        <div class="user-pill">
          <span class="avatar-icon" aria-hidden="true">👨‍👩‍👧</span>
          <div class="user-details">
            <span class="name">{{ auth.currentUser()?.nombre }} {{ auth.currentUser()?.apellido }}</span>
            <span class="tag tag-padre">Familia / Tutor</span>
          </div>
        </div>
        <button class="logout-btn" (click)="auth.logout()">Salir</button>
      </header>
      <main class="pwa-body">
        <div class="portal-card">
          <h1>Portal Familiar 📊</h1>
          <p class="subtitle">
            Seguimiento del progreso adaptativo, dominio temático y alertas académicas.
          </p>
          <div class="child-card">
            <div class="child-header">
              <div class="child-info">
                <h3>Emilia Solís</h3>
                <span class="grade">3ro Primaria &bull; Sección B</span>
              </div>
              <span class="status-badge">Activa en Plataforma</span>
            </div>
            <div class="mastery-summary">
              <div class="metric">
                <span class="metric-val">85%</span>
                <span class="metric-lbl">Dominio Global</span>
              </div>
              <div class="metric">
                <span class="metric-val">0</span>
                <span class="metric-lbl">Alertas Críticas</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .pwa-layout { min-height: 100vh; background: #020617; color: #f8fafc; font-family: system-ui, sans-serif; padding: 1.25rem; }
    .pwa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .user-pill { display: flex; align-items: center; gap: 0.75rem; background: #1e293b; padding: 0.5rem 1rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.1); }
    .avatar-icon { font-size: 1.35rem; }
    .user-details { display: flex; flex-direction: column; }
    .name { font-weight: 700; font-size: 0.95rem; }
    .tag-padre { font-size: 0.7rem; color: #facc15; font-weight: 600; }
    .logout-btn { background: #334155; color: #f8fafc; border: none; padding: 0.5rem 1.2rem; border-radius: 9999px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
    .logout-btn:hover { background: #475569; }
    .portal-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.12); border-radius: 1.5rem; padding: 2rem; }
    .portal-card h1 { margin: 0 0 0.5rem; font-size: 1.6rem; }
    .subtitle { color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.75rem; }
    .child-card { background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; }
    .child-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
    .child-info h3 { margin: 0 0 0.25rem; font-size: 1.15rem; }
    .grade { font-size: 0.8rem; color: #94a3b8; }
    .status-badge { background: rgba(74, 222, 128, 0.15); border: 1px solid rgba(74, 222, 128, 0.3); color: #4ade80; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .mastery-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .metric { background: rgba(15, 23, 42, 0.6); padding: 1rem; border-radius: 0.75rem; text-align: center; }
    .metric-val { display: block; font-size: 1.5rem; font-weight: 700; color: #38bdf8; }
    .metric-lbl { font-size: 0.75rem; color: #94a3b8; }
  `]
})
export class PadreDashboardComponent {
  readonly auth = inject(AuthService);
}
