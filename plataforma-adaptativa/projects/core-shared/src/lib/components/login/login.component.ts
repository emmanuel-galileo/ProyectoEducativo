import { Component, input, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SiblingPortalConfig, UserRole } from '../../models/auth.models';

@Component({
  selector: 'lib-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly auth = inject(AuthService);

  readonly appName = input.required<string>();
  readonly portalSubtitle = input.required<string>();
  readonly allowedRoles = input.required<UserRole[]>();
  readonly siblingConfig = input.required<SiblingPortalConfig>();

  identifier = signal('');
  secret = signal('');
  showSecret = signal(false);

  toggleSecretVisibility(): void {
    this.showSecret.update((v) => !v);
  }

  fillDemo(identifier: string, secret: string): void {
    this.identifier.set(identifier);
    this.secret.set(secret);
  }

  onSubmit(): void {
    if (!this.identifier().trim() || !this.secret().trim()) return;
    this.auth
      .login(
        this.identifier().trim(),
        this.secret().trim(),
        this.allowedRoles(),
        this.siblingConfig()
      )
      .subscribe();
  }
}
