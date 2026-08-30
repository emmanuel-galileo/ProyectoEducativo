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
    loadComponent: () =>
      import('./pages/profesor/profesor-dashboard.component').then(
        (m) => m.ProfesorDashboardComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
