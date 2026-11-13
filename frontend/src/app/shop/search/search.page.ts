import { Component, computed, signal, effect } from '@angular/core';
import { ProductSkeletonComponent } from '../../shared/skeleton';
import { productIcon, productIconSet } from '../../services/product-icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  addOutline,
  closeOutline,
  removeOutline,
  searchOutline,
} from 'ionicons/icons';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonFooter,
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
  IonModal,
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
    ProductSkeletonComponent,
    IonModal,
    IonFooter,
    IonButtons,
  ],
})
export class SearchPage {
  // Variables
  items = signal<any[]>([]);
  loading = signal(true);
  loadFailed = signal(false);
  placeholders = [1, 2, 3, 4, 5, 6];
  selectedCategory = signal<string>('All');
  displayLimit = signal<number>(10);
  loadingMore = signal(false);
  detailOpen = signal(false);
  detailItem = signal<any | null>(null);
  detailQty = signal(1);
  detailTotal = computed(
    () => Number(this.detailItem()?.ITEM_PRICE ?? 0) * this.detailQty(),
  );
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
    addIcons({
      ...productIconSet,
      addOutline,
      closeOutline,
      removeOutline,
      searchOutline,
    });
  }

  // Item filtering and search query
  filteredItems = computed(() => {
    const category = this.selectedCategory();
    const allItems = this.items();
    const query = this.searchQuery().toLowerCase().trim();

    return allItems.filter((item) => {
      const matchesCategory =
        category === 'All' ||
        (item.ITEM_CATEGORY || '').toLowerCase() === category.toLowerCase();

      const name = (item.ITEM_NAME || '').toLowerCase();
      const description = (item.ITEM_DESCRIPTION || '').toLowerCase();
      const matchesSearch =
        query === '' || name.includes(query) || description.includes(query);

      return matchesCategory && matchesSearch;
    });
  });

  categories = computed(() => {
    const seen = new Map<string, string>();
    for (const item of this.items()) {
      const name = (item.ITEM_CATEGORY || '').replace(/\s+/g, ' ').trim();
      if (name && !seen.has(name.toLowerCase()))
        seen.set(name.toLowerCase(), name);
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  });

  iconFor(item: any): string {
    return productIcon(item.ITEM_NAME, item.ITEM_CATEGORY);
  }
  handleSearch(event: any) {
    this.searchQuery.set(event.target.value ?? '');
  }

  clearFilters() {
    this.selectedCategory.set('All');
    this.searchQuery.set('');
  }

  // Infinite scrolling
  visibleItems = computed(() =>
    this.filteredItems().slice(0, this.displayLimit()),
  );
  noMoreItems = computed(
    () => this.displayLimit() >= this.filteredItems().length,
  );

  moreSkeletons = computed(() => {
    const remaining = this.filteredItems().length - this.displayLimit();
    return Array.from(
      { length: Math.max(0, Math.min(remaining, 4)) },
      (_, i) => i,
    );
  });

  loadMore(event: any) {
    this.loadingMore.set(true);
    setTimeout(() => {
      this.displayLimit.update((current) => current + 10);
      this.loadingMore.set(false);
      event.target.complete();
    }, 350);
  }

  // Buy now: add to the logged-in user's cart and confirm with a toast (stay on this page)
  buyNow(item: any, quantity = 1) {
    const userId = Number(localStorage.getItem('user_id'));
    if (!Number.isInteger(userId) || userId <= 0) {
      this.showToast('Please sign in to buy items.', 'danger');
      this.router.navigateByUrl('/auth');
      return;
    }

    if (this.addingItemId() !== null) return; // ignore double taps
    this.addingItemId.set(item.ITEM_ID);

    this.apiServices
      .addToCart({ user_id: userId, item_id: item.ITEM_ID, quantity })
      .subscribe({
        next: (res: any) => {
          this.addingItemId.set(null);
          this.detailOpen.set(false);
          this.showToast(
            res?.already_in_cart
              ? `${item.ITEM_NAME} is already in your cart.`
              : quantity > 1
                ? `${quantity} × ${item.ITEM_NAME} added to cart!`
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

  private async showToast(
    message: string,
    color: 'success' | 'danger',
    withViewCart = false,
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: withViewCart
        ? [
            {
              text: 'View cart',
              handler: () => this.router.navigateByUrl('/cart'),
            },
          ]
        : [],
    });
    await toast.present();
  }

  // Item fetching
  ionViewWillEnter() {
    this.loadItems();
  }

  loadItems() {
    this.loadFailed.set(false);
    this.apiServices.getItems().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.items.set(response);
        } else if (response && Array.isArray(response.items)) {
          this.items.set(response.items);
        } else {
          this.items.set([]);
        }
        this.loading.set(false);
        const active = this.selectedCategory().toLowerCase();
        if (
          active !== 'all' &&
          !this.categories().some((c) => c.toLowerCase() === active)
        ) {
          this.selectedCategory.set('All');
        }
      },
      error: (err: any) => {
        console.error('Error fetching items', err);
        this.loading.set(false);
        // keep showing what we already have; only show the error if there is nothing
        if (this.items().length === 0) this.loadFailed.set(true);
      },
    });
  }

  openDetails(item: any) {
    this.detailItem.set(item);
    this.detailQty.set(1);
    this.detailOpen.set(true);
  }

  closeDetails() {
    // the item stays set so the sheet doesn't go blank while it slides away
    this.detailOpen.set(false);
  }

  changeDetailQty(delta: number) {
    this.detailQty.update((q) => Math.min(99, Math.max(1, q + delta)));
  }

  photoOf(item:any): string | null {
    return this.apiServices.imageUrl(item.ITEM_IMAGE);
  }

  hideImage(event: Event): void{
    (event.target as HTMLElement).style.display = 'none';
  }
}
