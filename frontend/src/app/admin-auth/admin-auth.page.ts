import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  eyeOffOutline,
  eyeOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonSpinner,
} from '@ionic/angular';
import { AdminSessionService } from '../services/admin-session.service';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-admin-auth',
  templateUrl: './admin-auth.page.html',
  styleUrls: ['./admin-auth.page.scss'],
  imports: [
    FormsModule,
    RouterLink,
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonSpinner,
  ],
})
export class AdminAuthPage {
  private readonly api = inject(ApiService);
  private readonly session = inject(AdminSessionService);
  private readonly router = inject(Router);

  protected loginData = { email: '', password: '' };
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  constructor() {
    addIcons({
      alertCircleOutline,
      arrowBackOutline,
      eyeOffOutline,
      eyeOutline,
      shieldCheckmarkOutline,
    });
  }

  onAdminLogin(): void {
    if (this.loading()) return;

    const email = this.loginData.email.trim();
    const password = this.loginData.password;
    if (!email || !password) {
      this.error.set('Enter your email and password.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.api.adminLogin(email, password).subscribe({
      next: (res: any) => {
        this.session.start(res);
        this.loading.set(false);
        this.loginData.password = '';
        this.router.navigateByUrl('/admin', { replaceUrl: true });
      },
      error: (err: any) => {
        this.loading.set(false);
        const detail = err?.error?.detail;
        this.error.set(
          err?.status === 401
            ? 'Wrong email or password.'
            : err?.status === 403
              ? detail === 'Account is not active'
                ? 'This account is not active.'
                : 'This account does not have admin access.'
              : 'Could not reach the server. Please try again.',
        );
      },
    });
  }
}
