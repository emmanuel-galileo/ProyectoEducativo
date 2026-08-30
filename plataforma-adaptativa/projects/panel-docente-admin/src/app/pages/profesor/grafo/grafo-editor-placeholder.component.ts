import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService, CursoService, Curso } from 'core-shared';

@Component({
  selector: 'app-grafo-editor-placeholder',
  imports: [RouterLink],
  template: `
    <div class="editor-layout">
      <!-- Top Bar -->
      <header class="topbar">
        <div class="brand">
          <a [routerLink]="['/profesor/clases', cursoId()]" class="back-link">
            ← Volver a Configuración de Clase
          </a>
          <span class="divider">/</span>
          <span class="title">Editor Visual de Grafo Curricular</span>
        </div>
        <div class="user-meta">
          <span class="badge-source">
            Modo: {{ getOrigenLabel() }}
          </span>
          <button class="approve-btn" disabled title="Disponible en siguiente fase">
            ✓ Aprobar Grafo para Alumnos
          </button>
        </div>
      </header>

      <!-- Main Editor Container -->
      <main class="editor-body">
        <div class="convergence-banner">
          <div class="icon">🗺️</div>
          <div class="banner-text">
            <h2>Punto Único de Convergencia Curricular</h2>
            <p>
              Has ingresado mediante: <strong>{{ getOrigenLabel() }}</strong>.
              Aquí el docente refinará los nodos temáticos, trazará dependencias de prerrequisitos y validará la progresión adaptativa antes de la activación final (<code>grafo_aprobado = true</code>).
            </p>
          </div>
        </div>

        <div class="canvas-placeholder">
          <div class="canvas-grid-pattern"></div>
          <div class="canvas-content">
            <span class="canvas-icon">🕸️</span>
            <h3>Lienzo de Grafo de Conocimiento (Canvas 2D)</h3>
            <p>El motor visual interactivo de nodos y aristas se integrará en la siguiente etapa del sprint.</p>
            <div class="sample-nodes-preview">
              <span class="sample-node node-1">t1: Sílaba (Base)</span>
              <span class="sample-arrow">➔</span>
              <span class="sample-node node-2">t2: Sílaba Tónica</span>
              <span class="sample-arrow">➔</span>
              <span class="sample-node node-3">t3: Acentuación</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .editor-layout { min-height: 100vh; background: #030712; color: #f8fafc; font-family: system-ui, sans-serif; }
    .topbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #0f172a; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .back-link { color: #38bdf8; text-decoration: none; font-weight: 600; font-size: 0.9rem; &:hover { color: #7dd3fc; } }
    .divider { color: #64748b; }
    .title { font-weight: 700; font-size: 0.95rem; }
    .user-meta { display: flex; align-items: center; gap: 1rem; }
    .badge-source { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.7rem; border-radius: 9999px; }
    .approve-btn { background: #059669; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.85rem; opacity: 0.6; cursor: not-allowed; }
    .editor-body { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .convergence-banner { display: flex; gap: 1.25rem; align-items: center; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; }
    .convergence-banner .icon { font-size: 2.25rem; }
    .banner-text h2 { margin: 0 0 0.25rem; font-size: 1.2rem; color: #fff; }
    .banner-text p { margin: 0; font-size: 0.9rem; color: #94a3b8; line-height: 1.5; }
    .canvas-placeholder { position: relative; height: 480px; background: #0b1329; border: 1px solid rgba(255,255,255,0.1); border-radius: 1.5rem; display: flex; align-items: center; justify-content: center; overflow: hidden; text-align: center; }
    .canvas-grid-pattern { position: absolute; inset: 0; background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px); background-size: 24px 24px; pointer-events: none; }
    .canvas-content { position: relative; z-index: 2; padding: 2rem; }
    .canvas-icon { font-size: 3rem; display: block; margin-bottom: 0.75rem; }
    .canvas-content h3 { font-size: 1.35rem; margin: 0 0 0.5rem; color: #ffffff; }
    .canvas-content p { color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; }
    .sample-nodes-preview { display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
    .sample-node { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; padding: 0.5rem 1rem; border-radius: 0.6rem; font-size: 0.85rem; font-weight: 600; }
    .sample-arrow { color: #64748b; font-size: 1rem; }
  `]
})
export class GrafoEditorPlaceholderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  cursoId = signal<string>('');
  origen = signal<string>('cnb');

  ngOnInit(): void {
    this.cursoId.set(this.route.snapshot.paramMap.get('id') || '');
    this.route.queryParamMap.subscribe((params) => {
      this.origen.set(params.get('origen') || 'cnb');
    });
  }

  getOrigenLabel(): string {
    switch (this.origen()) {
      case 'cnb':
        return 'Plantilla Oficial CNB de Guatemala';
      case 'pdf':
        return 'Extracción Inteligente de PDF / Programa';
      case 'blanco':
        return 'Lienzo en Blanco (Manual)';
      default:
        return 'Plantilla Curricular';
    }
  }
}
