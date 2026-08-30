import { Component, input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'lib-portal-select',
  templateUrl: './portal-select.component.html',
  styleUrl: './portal-select.component.scss',
})
export class PortalSelectComponent {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  /** Indicates if current app is 'teacher-admin' (panel) or 'student-parent' (pwa) */
  readonly currentPortalType = input.required<'teacher-admin' | 'student-parent'>();
  readonly siblingPortalUrl = input.required<string>();

  selectStudentsParents(): void {
    if (this.currentPortalType() === 'student-parent') {
      this.router.navigate(['/login']);
    } else {
      window.location.href = this.siblingPortalUrl();
    }
  }

  selectTeachersAdmins(): void {
    if (this.currentPortalType() === 'teacher-admin') {
      this.router.navigate(['/login']);
    } else {
      window.location.href = this.siblingPortalUrl();
    }
  }
}
