import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from 'core-shared';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();

    if (!auth.isAuthenticated() || !user) {
      router.navigate(['/login']);
      return false;
    }

    if (!allowedRoles.includes(user.rol)) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  };
};
