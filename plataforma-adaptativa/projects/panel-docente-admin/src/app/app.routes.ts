import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/portal-select/portal-select-page.component').then(
        (m) => m.PortalSelectPageComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'admin',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () =>
      import('./pages/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'profesor',
    canActivate: [roleGuard(['profesor'])],
    children: [
      {
        path: '',
        redirectTo: 'clases',
        pathMatch: 'full',
      },
      {
        path: 'clases',
        loadComponent: () =>
          import('./pages/profesor/mis-clases/mis-clases.component').then(
            (m) => m.MisClasesComponent
          ),
      },
      {
        path: 'clases/:id',
        loadComponent: () =>
          import('./pages/profesor/detalle-clase/detalle-clase.component').then(
            (m) => m.DetalleClaseComponent
          ),
      },
      {
        path: 'clases/:id/grafo',
        loadComponent: () =>
          import(
            './pages/profesor/grafo/grafo-editor-placeholder.component'
          ).then((m) => m.GrafoEditorPlaceholderComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
