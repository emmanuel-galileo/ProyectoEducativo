import { Component } from '@angular/core';
import { LoginComponent, SiblingPortalConfig, UserRole } from 'core-shared';

@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  template: `
    <lib-login
      appName="App Estudiantes y Familias"
      portalSubtitle="Ruta de aprendizaje adaptativa, mapa de desafíos y progreso escolar"
      [allowedRoles]="allowedRoles"
      [siblingConfig]="siblingConfig"
    />
  `,
})
export class LoginPageComponent {
  readonly allowedRoles: UserRole[] = ['alumno', 'padre'];
  readonly siblingConfig: SiblingPortalConfig = {
    portalUrl: 'http://localhost:4200',
    portalName: 'Portal Docente y Administrativo',
    mismatchMessage:
      'Hola, María. Esta aplicación está optimizada para alumnos y familias. Para gestionar tu aula, abre el Portal Docente y Administrativo.',
  };
}
