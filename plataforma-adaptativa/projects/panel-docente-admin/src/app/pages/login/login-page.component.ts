import { Component } from '@angular/core';
import { LoginComponent, SiblingPortalConfig, UserRole } from 'core-shared';

@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  template: `
    <lib-login
      appName="Portal Docente y Administrativo"
      portalSubtitle="Gestión académica, configuración curricular y seguimiento grupal"
      [allowedRoles]="allowedRoles"
      [siblingConfig]="siblingConfig"
    />
  `,
})
export class LoginPageComponent {
  readonly allowedRoles: UserRole[] = ['admin', 'profesor'];
  readonly siblingConfig: SiblingPortalConfig = {
    portalUrl: 'http://localhost:4201',
    portalName: 'Aplicación Móvil Alumnos / Padres',
    mismatchMessage:
      'Tu cuenta corresponde a un perfil de estudiante o padre de familia. Por favor accede desde la Aplicación Móvil / Tablet.',
  };
}
