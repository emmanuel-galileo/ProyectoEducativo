import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'alumno',
    canActivate: [roleGuard(['alumno'])],
    loadComponent: () =>
      import('./pages/alumno/alumno-dashboard.component').then((m) => m.AlumnoDashboardComponent),
  },
  {
    path: 'padre',
    canActivate: [roleGuard(['padre'])],
    loadComponent: () =>
      import('./pages/padre/padre-dashboard.component').then((m) => m.PadreDashboardComponent),
  },
  { path: '**', redirectTo: 'login' },
];
