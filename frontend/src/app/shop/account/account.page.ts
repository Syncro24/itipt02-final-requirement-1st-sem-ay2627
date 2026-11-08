import { Component, computed, signal } from '@angular/core';
import { OrderSkeletonComponent } from '../../shared/skeleton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  IonAlert,
  IonModal,
  IonInput,
  IonButtons,
  ToastController,
  IonSkeletonText,
  AlertController,
} from '@ionic/angular';
import { ApiService } from '../../services/api';
import { addIcons } from 'ionicons';
import {
  bagHandleOutline,
  personOutline,
  locationOutline,
  logOutOutline,
  closeOutline,
  createOutline,
} from 'ionicons/icons';

const EMPTY_USER = { NAME: '', EMAIL: '', FIRST_NAME: '', LAST_NAME: '' };

interface OrderLine {
  ITEM_NAME: string;
  ITEM_PRICE: number | string;
  QUANTITY: number;
}

interface UserOrder {
  ORDER_ID: number;
  TOTAL_AMOUNT: number | string;
  STATUS: string;
  CREATED_AT: string;
  ITEMS?: OrderLine[];
}

/** What the customer reads under each status. */
const STATUS_NOTES: Record<string, string> = {
  pending: 'Waiting for the store to confirm',
  approved: 'Confirmed by the store. To change it, contact the store.',
  cancelled: 'This order was cancelled',
};

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonButton,
    IonAlert,
    IonModal,
    IonInput,
    IonButtons,
    OrderSkeletonComponent,
    IonSkeletonText,
  ],
})
export class AccountPage {
  user = signal<any>({ ...EMPTY_USER });

  // Orders
  orders = signal<UserOrder[]>([]);
  ordersState = signal<'loading' | 'ready' | 'error'>('loading');

  orderRows = computed(() =>
    this.orders().map((order) => {
      const items = order.ITEMS ?? [];
      const key = (order.STATUS || 'Pending').toLowerCase();
      return {
        ...order,
        pillClass: `pill pill--${key}`,
        note: STATUS_NOTES[key] ?? '',
        summary: items
          .map((line) => `${line.QUANTITY} × ${line.ITEM_NAME}`)
          .join(', '),
      };
    }),
  );

  // Edit modal state
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false); // false = read-only view, true = edit form
  editFirstName = signal<string>('');
  editLastName = signal<string>('');
  editEmail = signal<string>('');
  cancellingId = signal<number | null>(null);

  constructor(
    private apiService: ApiService,
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController,
  ) {
    addIcons({
      bagHandleOutline,
      personOutline,
      locationOutline,
      logOutOutline,
      closeOutline,
      createOutline,
    });
  }

  // Runs every time the tab is entered, so profile and order statuses are always fresh
  ionViewWillEnter() {
    this.loadUserProfile();
    this.loadOrders();
  }

  /** The id saved by the auth page at login (key must match auth.page.ts: 'user_id'). */
  private getLoggedInUserId(): number | null {
    const stored = localStorage.getItem('user_id');
    const id = stored ? Number(stored) : NaN;
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  loadUserProfile() {
    const userId = this.getLoggedInUserId();
    if (userId === null) {
      this.logout(); // not logged in
      return;
    }

    this.apiService.getUserProfile(userId).subscribe({
      next: (res: any) => this.user.set(res),
      error: (err: any) => {
        console.error('Error loading profile', err);
        if (err.status === 404) {
          this.logout(); // stored id no longer exists
        }
      },
    });
  }

  loadOrders() {
    const userId = this.getLoggedInUserId();
    if (userId === null) return;

    this.ordersState.set('loading');
    this.apiService.getUserOrders(userId).subscribe({
      next: (res: any) => {
        this.orders.set(res.orders ?? []);
        this.ordersState.set('ready');
      },
      error: (err: any) => {
        console.error('Error loading orders', err);
        this.ordersState.set('error');
      },
    });
  }

    async confirmCancel(order: UserOrder) {
    const alert = await this.alertController.create({
      header: 'Cancel this order?',
      message: `Order #${order.ORDER_ID} will be cancelled. This can't be undone.`,
      buttons: [
        { text: 'Keep order', role: 'cancel' },
        { text: 'Cancel order', role: 'destructive', handler: () => this.cancelOrder(order.ORDER_ID) },
      ],
    });
    await alert.present();
  }

  private cancelOrder(orderId: number) {
    const userId = this.getLoggedInUserId();
    if (userId === null) return;

    this.cancellingId.set(orderId);
    this.apiService.cancelMyOrder(orderId, userId).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.showToast(`Order #${orderId} was cancelled.`, 'success');
        this.loadOrders();
      },
      error: (err: any) => {
        this.cancellingId.set(null);
        // e.g. the admin approved it a moment ago; the message says so
        this.showToast(err?.error?.detail ?? 'Could not cancel the order.', 'danger');
        this.loadOrders();
      },
    });
  }

  /** Opens the modal in read-only mode (used by "Profile information"). */
  viewProfile() {
    this.isEditing.set(false);
    this.isModalOpen.set(true);
  }

  /** Switches to edit mode, prefilled with the current values. */
  startEdit() {
    const current = this.user();
    this.editFirstName.set(current.FIRST_NAME || '');
    this.editLastName.set(current.LAST_NAME || '');
    this.editEmail.set(current.EMAIL || '');
    this.isEditing.set(true);
  }

  /** Opens the modal straight in edit mode (used by "Edit profile"). */
  openEditModal() {
    this.startEdit();
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveProfile() {
    const userId = this.getLoggedInUserId();
    if (userId === null) {
      this.logout();
      return;
    }

    const payload = {
      first_name: this.editFirstName(),
      last_name: this.editLastName(),
      email: this.editEmail(),
    };

    this.apiService.updateUserProfile(userId, payload).subscribe({
      next: async () => {
        this.user.set({
          ...this.user(),
          FIRST_NAME: payload.first_name,
          LAST_NAME: payload.last_name,
          NAME: `${payload.first_name} ${payload.last_name}`,
          EMAIL: payload.email,
        });

        this.isModalOpen.set(false);
        await this.showToast('Profile updated successfully!', 'success');
      },
      error: async (err: any) => {
        console.error('Error updating profile', err);
        await this.showToast('Failed to update profile.', 'danger');
      },
    });
  }

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    this.user.set({ ...EMPTY_USER });
    this.orders.set([]);
    this.isModalOpen.set(false);
    this.router.navigateByUrl('/auth', { replaceUrl: true }); // use your auth route path
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }
}
