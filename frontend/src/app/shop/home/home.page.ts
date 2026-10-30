import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cubeOutline,
  gridOutline,
  hardwareChipOutline,
  headsetOutline,
  searchOutline,
} from 'ionicons/icons';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonCard,
    IonCardContent,
  ],
})
export class HomePage {
  items = signal<any[]>([]);
  loaded = signal(false);
  loadFailed = signal(false);
  addingItemId = signal<number | null>(null);

  // The feed shows a short preview; "See all" opens the full search page
  featuredItems = computed(() => this.items().slice(0, 8));

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController,
  ) {
    addIcons({ cubeOutline, gridOutline, hardwareChipOutline, headsetOutline, searchOutline });
  }

  ionViewWillEnter() {
    this.loadItems();
  }

  loadItems() {
    this.loadFailed.set(false);
    this.apiService.getItems().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res?.items;
        this.items.set(Array.isArray(list) ? list : []);
        this.loaded.set(true);
      },
      error: (err: any) => {
        console.error('Failed to load items', err);
        this.loadFailed.set(true);
        this.loaded.set(true);
      },
    });
  }

  goToSearch() {
    this.router.navigateByUrl('/search');
  }

  // Passes the chosen category to the search page (it reads history.state.category)
  filterByCategory(category: string) {
    this.router.navigateByUrl('/search', { state: { category } });
  }

  categoryIcon(category?: string): string {
    switch ((category || '').toLowerCase()) {
      case 'electronics':
        return 'hardware-chip-outline';
      case 'accessories':
        return 'headset-outline';
      default:
        return 'cube-outline';
    }
  }

  addToCart(item: any) {
    const userId = Number(localStorage.getItem('user_id'));
    if (!Number.isInteger(userId) || userId <= 0) {
      this.showToast('Please sign in to add items to your cart.', 'danger');
      this.router.navigateByUrl('/auth');
      return;
    }

    if (this.addingItemId() !== null) return; // ignore double taps
    this.addingItemId.set(item.ITEM_ID);

    this.apiService.addToCart({ user_id: userId, item_id: item.ITEM_ID, quantity: 1 }).subscribe({
      next: (res: any) => {
        this.addingItemId.set(null);
        this.showToast(
          res?.already_in_cart
            ? `${item.ITEM_NAME} is already in your cart.`
            : `${item.ITEM_NAME} added to cart!`,
          'success',
          true,
        );
      },
      error: (err: any) => {
        console.error('Failed to add to cart', err);
        this.addingItemId.set(null);
        this.showToast('Failed to add item to cart.', 'danger');
      },
    });
  }

  private async showToast(message: string, color: 'success' | 'danger', withViewCart = false) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: withViewCart
        ? [{ text: 'View cart', handler: () => this.router.navigateByUrl('/cart') }]
        : [],
    });
    await toast.present();
  }
}