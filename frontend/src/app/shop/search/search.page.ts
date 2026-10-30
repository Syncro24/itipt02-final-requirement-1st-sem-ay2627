import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { cubeOutline, hardwareChipOutline, headsetOutline, searchOutline } from 'ionicons/icons';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    CommonModule,
    FormsModule,
    IonItem,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
  ],
})
export class SearchPage {
  // Variables
  items = signal<any[]>([]);
  selectedCategory = signal<string>('All');
  displayLimit = signal<number>(10);
  searchQuery = signal<string>('');
  addingItemId = signal<number | null>(null); // item currently being added to the cart

  constructor(
    private apiServices: ApiService,
    private router: Router,
    private toastController: ToastController,
  ) {
    effect(() => {
      this.selectedCategory();
      this.searchQuery();
      this.displayLimit.set(10);
    });
    addIcons({ searchOutline, hardwareChipOutline, headsetOutline, cubeOutline });
  }

  // Item filtering and search query
  filteredItems = computed(() => {
    const category = this.selectedCategory();
    const allItems = this.items();
    const query = this.searchQuery().toLowerCase().trim();

    return allItems.filter((item) => {
      const matchesCategory =
        category === 'All' || (item.ITEM_CATEGORY || '').toLowerCase() === category.toLowerCase();

      const name = (item.ITEM_NAME || '').toLowerCase();
      const description = (item.ITEM_DESCRIPTION || '').toLowerCase();
      const matchesSearch = query === '' || name.includes(query) || description.includes(query);

      return matchesCategory && matchesSearch;
    });
  });

  handleSearch(event: any) {
    this.searchQuery.set(event.target.value ?? '');
  }

  clearFilters() {
    this.selectedCategory.set('All');
    this.searchQuery.set('');
  }

  // Infinite scrolling
  visibleItems = computed(() => this.filteredItems().slice(0, this.displayLimit()));
  noMoreItems = computed(() => this.displayLimit() >= this.filteredItems().length);

  loadMore(event: any) {
    setTimeout(() => {
      this.displayLimit.update((current) => current + 10);
      event.target.complete();
    }, 400);
  }

  // Buy now: add to the logged-in user's cart and confirm with a toast (stay on this page)
  buyNow(item: any) {
    const userId = Number(localStorage.getItem('user_id'));
    if (!Number.isInteger(userId) || userId <= 0) {
      this.showToast('Please sign in to buy items.', 'danger');
      this.router.navigateByUrl('/auth');
      return;
    }

    if (this.addingItemId() !== null) return; // ignore double taps
    this.addingItemId.set(item.ITEM_ID);

    this.apiServices
      .addToCart({ user_id: userId, item_id: item.ITEM_ID, quantity: 1 })
      .subscribe({
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
          this.showToast('Could not add the item to your cart.', 'danger');
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

  // Item fetching
  ionViewWillEnter() {
    this.loadItems();
  }

  loadItems() {
    this.apiServices.getItems().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.items.set(response);
        } else if (response && Array.isArray(response.items)) {
          this.items.set(response.items);
        } else {
          this.items.set([]);
        }
      },
      error: (err: any) => {
        console.error('Error fetching items', err);
      },
    });
  }
}