import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { CartSkeletonComponent } from '../../shared/skeleton';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  addOutline,
  cartOutline,
  removeOutline,
  trashOutline,
} from 'ionicons/icons';
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { ApiService } from '../../services/api';
import { productIcon, productIconSet } from '../../services/product-icon';

interface CartRow {
  CART_ITEM_ID: number;
  ITEM_ID: number;
  QUANTITY: number;
  ITEM_NAME: string;
  ITEM_PRICE: number | string;
  ITEM_CATEGORY: string | null;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  imports: [
    DecimalPipe,
    RouterLink,
    IonButton,
    IonCheckbox,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    CartSkeletonComponent,
  ],
})
export class CartPage {
  protected readonly items = signal<CartRow[]>([]);
  protected readonly selected = signal<ReadonlySet<number>>(new Set());
  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly placing = signal(false);

  /** Rows already shown, so new items start ticked and unticked ones stay unticked. */
  private known = new Set<number>();

  protected readonly selectedItems = computed(() =>
    this.items().filter((i) => this.selected().has(i.CART_ITEM_ID)),
  );
  protected readonly selectedCount = computed(
    () => this.selectedItems().length,
  );
  protected readonly allSelected = computed(
    () =>
      this.items().length > 0 && this.selectedCount() === this.items().length,
  );
  protected readonly total = computed(() =>
    this.selectedItems().reduce(
      (sum, i) => sum + Number(i.ITEM_PRICE) * i.QUANTITY,
      0,
    ),
  );

  constructor(
    private api: ApiService,
    private router: Router,
    private toasts: ToastController,
  ) {
    addIcons({
      ...productIconSet,
      addOutline,
      cartOutline,
      removeOutline,
      trashOutline,
    });
  }

  // Items can be added from the search tab, so reload every time this tab opens
  ionViewWillEnter(): void {
    this.load();
  }

  private userId(): number | null {
    const id = Number(localStorage.getItem('user_id'));
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  load(): void {
    const userId = this.userId();
    if (userId === null) {
      this.router.navigateByUrl('/auth', { replaceUrl: true });
      return;
    }

    this.api.getCart(userId).subscribe({
      next: (res: any) => {
        const rows: CartRow[] = res.cart ?? [];
        const next = new Set<number>();
        for (const row of rows) {
          const id = row.CART_ITEM_ID;
          if (!this.known.has(id) || this.selected().has(id)) next.add(id);
        }
        this.known = new Set(rows.map((r) => r.CART_ITEM_ID));
        this.items.set(rows);
        this.selected.set(next);
        this.state.set('ready');
      },
      error: (err: any) => {
        console.error('Failed to load cart', err);
        this.state.set('error');
      },
    });
  }

  protected iconFor(row: CartRow): string {
    return productIcon(row.ITEM_NAME, row.ITEM_CATEGORY);
  }

  protected lineTotal(row: CartRow): number {
    return Number(row.ITEM_PRICE) * row.QUANTITY;
  }

  // ---------- selection ----------

  protected onToggle(id: number, event: Event): void {
    const checked = (event as CustomEvent<{ checked: boolean }>).detail.checked;
    const next = new Set(this.selected());
    if (checked) next.add(id);
    else next.delete(id);
    this.selected.set(next);
  }

  protected onToggleAll(event: Event): void {
    const checked = (event as CustomEvent<{ checked: boolean }>).detail.checked;
    this.selected.set(
      checked ? new Set(this.items().map((i) => i.CART_ITEM_ID)) : new Set(),
    );
  }

  // ---------- quantity / remove ----------

  protected changeQuantity(row: CartRow, delta: number): void {
    const quantity = row.QUANTITY + delta;
    if (quantity < 1 || quantity > 99) return;

    // Update the screen first, then tell the server; reload if the server refuses
    this.items.update((list) =>
      list.map((i) =>
        i.CART_ITEM_ID === row.CART_ITEM_ID ? { ...i, QUANTITY: quantity } : i,
      ),
    );
    this.api.updateCartQuantity(row.CART_ITEM_ID, quantity).subscribe({
      error: () => {
        this.showToast('Could not update the quantity.', 'danger');
        this.load();
      },
    });
  }

  protected remove(row: CartRow): void {
    this.api.removeCartItem(row.CART_ITEM_ID).subscribe({
      next: () => {
        this.items.update((list) =>
          list.filter((i) => i.CART_ITEM_ID !== row.CART_ITEM_ID),
        );
        const next = new Set(this.selected());
        next.delete(row.CART_ITEM_ID);
        this.selected.set(next);
        this.known.delete(row.CART_ITEM_ID);
      },
      error: () => this.showToast('Could not remove the item.', 'danger'),
    });
  }

  // ---------- checkout ----------

  protected checkout(): void {
    const userId = this.userId();
    if (userId === null) {
      this.router.navigateByUrl('/auth', { replaceUrl: true });
      return;
    }
    if (this.placing() || this.selectedCount() === 0) return;

    this.placing.set(true);
    this.api
      .placeOrder({
        user_id: userId,
        cart_item_ids: this.selectedItems().map((i) => i.CART_ITEM_ID),
      })
      .subscribe({
        next: (res: any) => {
          this.placing.set(false);
          this.load(); // the ordered items are gone from the cart now
          this.showToast(
            `Order #${res.order_id} placed. Waiting for approval.`,
            'success',
            true,
          );
        },
        error: (err: any) => {
          console.error('Checkout failed', err);
          this.placing.set(false);
          this.showToast(
            err?.error?.detail ??
              'Could not place your order. Please try again.',
            'danger',
          );
          this.load();
        },
      });
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger',
    withViewOrders = false,
  ): Promise<void> {
    const toast = await this.toasts.create({
      message,
      duration: 4000,
      color,
      position: 'top',
      buttons: withViewOrders
        ? [
            {
              text: 'View',
              handler: () => this.router.navigateByUrl('/account'),
            },
          ]
        : [],
    });
    await toast.present();
  }
}
