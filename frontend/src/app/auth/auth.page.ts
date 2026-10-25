import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  ToastController,
} from '@ionic/angular';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  imports: [
    FormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonItem,
    IonInput,
    IonButton,
  ],
})
export class AuthPage {
  // Signal so the view updates even when changed inside an HTTP callback
  authMode = signal<'signin' | 'signup'>('signin');
  loading = signal(false);

  loginData = { email: '', password: '' };
  signupData = { f_name: '', l_name: '', email: '', password: '' };

  constructor(
    private api: ApiService,
    private router: Router,
    private toastController: ToastController,
  ) {}

  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.presentToast('Please fill in all the fields', 'danger');
      return;
    }

    this.loading.set(true);
    this.api.login(this.loginData).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.presentToast(`Welcome back, ${res.name}!`, 'success'); // backticks, not quotes
        localStorage.setItem('user_id', String(res.user_id));
        localStorage.setItem('user_role', res.role); // backend returns "role"
        this.router.navigateByUrl('home'); // must match a route in your routing file
      },
      error: (err: any) => {
        this.loading.set(false);
        this.presentToast(err.error?.detail || 'Invalid email or password', 'danger');
      },
    });
  }

  onSignup() {
    const { f_name, l_name, email, password } = this.signupData;
    if (!f_name || !l_name || !email || !password) {
      this.presentToast('Please complete all fields', 'danger');
      return;
    }

    // Backend expects first_name / last_name, not f_name / l_name
    const payload = { first_name: f_name, last_name: l_name, email, password };

    this.loading.set(true);
    this.api.signup(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.presentToast('Account created successfully! Please sign in.', 'success');
        this.loginData.email = email;
        this.signupData = { f_name: '', l_name: '', email: '', password: '' };
        this.authMode.set('signin');
      },
      error: (err: any) => {
        this.loading.set(false);
        this.presentToast(err.error?.detail || 'Registration failed', 'danger');
      },
    });
  }
}