import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCheckbox,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  bagHandleOutline,
  cartOutline,
  cubeOutline,
  hardwareChipOutline,
  headsetOutline,
  removeOutline,
  trashOutline,
} from 'ionicons/icons';
import { ApiService } from '../../services/api';

interface CartItem {
  CART_ITEM_ID: number;
  ITEM_ID: number;
  ITEM_NAME: string;
  ITEM_PRICE: number;
  ITEM_CATEGORY?: string;
  QUANTITY: number;
  selected: boolean;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCheckbox,
    IonFooter,
  ],
})
export class CartPage {
  cartItems = signal<CartItem[]>([]);

  // Derived values: they update automatically whenever cartItems changes
  selectedItems = computed(() => this.cartItems().filter((i) => i.selected));
  selectedCount = computed(() => this.selectedItems().length);
  totalPrice = computed(() =>
    this.selectedItems().reduce((sum, i) => sum + Number(i.ITEM_PRICE) * i.QUANTITY, 0),
  );
  allSelected = computed(
    () => this.cartItems().length > 0 && this.cartItems().every((i) => i.selected),
  );

  constructor(
    private api: ApiService,
    private router: Router,
    private toastController: ToastController,
  ) {
    addIcons({
      addOutline,
      bagHandleOutline,
      cartOutline,
      cubeOutline,
      hardwareChipOutline,
      headsetOutline,
      removeOutline,
      trashOutline,
    });
  }

  // Reload every time the tab is entered (e.g. right after "Buy now" on the search page)
  ionViewWillEnter() {
    this.loadCart();
  }

  private getLoggedInUserId(): number | null {
    const id = Number(localStorage.getItem('user_id'));
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  loadCart() {
    const userId = this.getLoggedInUserId();
    if (userId === null) {
      this.router.navigateByUrl('/auth', { replaceUrl: true });
      return;
    }

    // Item just added via "Buy now" is pre-selected; earlier selections are kept
    const justAddedId = history.state?.addedItemId;
    const previouslySelected = new Set(
      this.cartItems().filter((i) => i.selected).map((i) => i.CART_ITEM_ID),
    );

    this.api.getCart(userId).subscribe({
      next: (res: any) => {
        const items: CartItem[] = (res.cart || []).map((item: any) => ({
          ...item,
          selected: previouslySelected.has(item.CART_ITEM_ID) || item.ITEM_ID === justAddedId,
        }));
        this.cartItems.set(items);
      },
      error: (err: any) => console.error('Failed to load cart', err),
    });
  }

  // ----- Selection -----
  toggleItem(cartItemId: number, checked: boolean) {
    this.cartItems.update((items) =>
      items.map((i) => (i.CART_ITEM_ID === cartItemId ? { ...i, selected: checked } : i)),
    );
  }

  toggleSelectAll(checked: boolean) {
    this.cartItems.update((items) => items.map((i) => ({ ...i, selected: checked })));
  }

  // ----- Quantity -----
  changeQty(item: CartItem, delta: number) {
    const newQty = item.QUANTITY + delta;
    if (newQty < 1) {
      this.removeItem(item.CART_ITEM_ID);
      return;
    }

    this.cartItems.update((items) =>
      items.map((i) => (i.CART_ITEM_ID === item.CART_ITEM_ID ? { ...i, QUANTITY: newQty } : i)),
    );

    this.api.updateCartQuantity(item.CART_ITEM_ID, newQty).subscribe({
      error: (err: any) => {
        console.error('Failed to update quantity', err);
        this.loadCart(); // put the screen back in sync with the server
      },
    });
  }

  removeItem(cartItemId: number) {
    this.api.removeCartItem(cartItemId).subscribe({
      next: () =>
        this.cartItems.update((items) => items.filter((i) => i.CART_ITEM_ID !== cartItemId)),
      error: (err: any) => console.error('Failed to remove item', err),
    });
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

  // Placeholder: there is no orders endpoint yet
  async checkout() {
    const toast = await this.toastController.create({
      message: `Checkout successful for ₱${this.totalPrice().toFixed(2)}!`,
      duration: 3000,
      color: 'success',
    });
    await toast.present();
  }
}