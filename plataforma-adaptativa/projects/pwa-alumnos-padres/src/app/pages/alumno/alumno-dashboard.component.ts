import { Component, inject } from '@angular/core';
import { AuthService } from 'core-shared';

@Component({
  selector: 'app-alumno-dashboard',
  template: `
    <div class="pwa-layout">
      <header class="pwa-header">
        <div class="user-pill">
          <span class="avatar-icon" aria-hidden="true">🚀</span>
          <div class="user-details">
            <span class="name">{{ auth.currentUser()?.nombre }}</span>
            <span class="tag tag-alumno">Estudiante</span>
          </div>
        </div>
        <button class="logout-btn" (click)="auth.logout()">Salir</button>
      </header>
      <main class="pwa-body">
        <div class="mission-card">
          <div class="badge-mission">Misión Activa</div>
          <h1>¡Hola, {{ auth.currentUser()?.nombre }}! 🌟</h1>
          <p>
            Tu ruta de aprendizaje adaptativa está lista. Completa tu reto de hoy para avanzar en tu mapa de conocimientos.
          </p>
          <div class="topic-preview">
            <div class="topic-tag">Matemáticas &bull; 3ro Primaria</div>
            <h3>Suma y Resta con Llevada</h3>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: 65%;"></div>
            </div>
            <div class="progress-label">Dominio Actual: 65%</div>
          </div>
          <button class="cta-btn">Continuar Aprendiendo ▶</button>
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
    .tag-alumno { font-size: 0.7rem; color: #4ade80; font-weight: 600; }
    .logout-btn { background: #334155; color: #f8fafc; border: none; padding: 0.5rem 1.2rem; border-radius: 9999px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
    .logout-btn:hover { background: #475569; }
    .mission-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.12); border-radius: 1.5rem; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .badge-mission { display: inline-block; background: rgba(74, 222, 128, 0.15); border: 1px solid rgba(74, 222, 128, 0.3); color: #4ade80; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem; }
    .mission-card h1 { margin: 0 0 0.5rem; font-size: 1.6rem; }
    .mission-card p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
    .topic-preview { background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.25rem; margin-bottom: 1.5rem; }
    .topic-tag { font-size: 0.75rem; color: #38bdf8; font-weight: 600; margin-bottom: 0.25rem; }
    .topic-preview h3 { margin: 0 0 0.75rem; font-size: 1.15rem; }
    .progress-bar-bg { background: #334155; height: 8px; border-radius: 9999px; overflow: hidden; margin-bottom: 0.4rem; }
    .progress-bar-fill { background: linear-gradient(90deg, #10b981, #34d399); height: 100%; border-radius: 9999px; }
    .progress-label { font-size: 0.75rem; color: #94a3b8; text-align: right; }
    .cta-btn { width: 100%; padding: 0.9rem; border-radius: 0.85rem; border: none; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-size: 1rem; font-weight: 700; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4); transition: transform 0.2s; }
    .cta-btn:hover { transform: translateY(-1px); }
  `]
})
export class AlumnoDashboardComponent {
  readonly auth = inject(AuthService);
}
