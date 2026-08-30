import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthResponse, RoleMismatchNotice, SiblingPortalConfig, UserProfile, UserRole } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:8000/api/v1/auth';

  private readonly tokenKey = 'sp2_access_token';
  private readonly userKey = 'sp2_user_profile';

  // State Signals
  readonly currentUser = signal<UserProfile | null>(this.getStoredUser());
  readonly token = signal<string | null>(this.getStoredToken());
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly mismatchNotice = signal<RoleMismatchNotice | null>(null);

  // Derived Computed State
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.token());
  readonly userRole = computed(() => this.currentUser()?.rol ?? null);

  private getStoredToken(): string | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(this.tokenKey) : null;
    } catch {
      return null;
    }
  }

  private getStoredUser(): UserProfile | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.userKey);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  }

  login(
    identifier: string,
    secret: string,
    allowedRoles: UserRole[],
    siblingConfig: SiblingPortalConfig
  ): Observable<AuthResponse> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.mismatchNotice.set(null);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { identifier, secret }).pipe(
      tap((res) => {
        this.isLoading.set(false);
        const userRole = res.user.rol;

        if (!allowedRoles.includes(userRole)) {
          // Role boundary protection: Do not store token
          this.mismatchNotice.set({
            userName: `${res.user.nombre} ${res.user.apellido}`.trim(),
            userRole: userRole,
            message: siblingConfig.mismatchMessage,
            targetPortalUrl: siblingConfig.portalUrl,
            targetPortalName: siblingConfig.portalName,
          });
          return;
        }

        // Allowed role: persist and activate session
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.tokenKey, res.access_token);
            localStorage.setItem(this.userKey, JSON.stringify(res.user));
          }
        } catch (e) {
          console.warn('LocalStorage not accessible', e);
        }

        this.token.set(res.access_token);
        this.currentUser.set(res.user);

        // Navigate to role route
        this.router.navigate([`/${userRole}`]);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        const detail = err.error?.detail || 'Error al iniciar sesión. Verifique sus credenciales.';
        this.errorMessage.set(detail);
        return throwError(() => new Error(detail));
      })
    );
  }

  logout(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
      }
    } catch (e) {
      console.warn('LocalStorage cleanup failed', e);
    }
    this.token.set(null);
    this.currentUser.set(null);
    this.mismatchNotice.set(null);
    this.router.navigate(['/login']);
  }

  clearMismatchNotice(): void {
    this.mismatchNotice.set(null);
  }
}
