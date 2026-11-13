import { fileToResizedDataUrl } from '../services/image-file';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AdminRowSkeletonComponent } from '../shared/skeleton';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  add,
  archiveOutline,
  checkmarkOutline,
  closeOutline,
  createOutline,
  cubeOutline,
  hardwareChipOutline,
  headsetOutline,
  logOutOutline,
  receiptOutline,
  trashOutline,
  watchOutline,
} from 'ionicons/icons';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
  ToastController,
} from '@ionic/angular';
import { AdminSessionService } from '../services/admin-session.service';
import { ApiService } from '../services/api';

type AdminTab = 'products' | 'orders';
type ItemFilter = 'All' | 'Approved' | 'Pending' | 'Archived';
type OrderFilter = 'All' | 'Pending' | 'Approved' | 'Cancelled';

interface AdminItem {
  ITEM_ID: number;
  ITEM_NAME: string;
  ITEM_PRICE: number | string;
  ITEM_CATEGORY: string | null;
  ITEM_DESCRIPTION: string | null;
  ITEM_STATUS: string;
  ITEM_IMAGE: string;
}

interface AdminOrder {
  ORDER_ID: number;
  USER_NAME: string | null;
  USER_EMAIL: string | null;
  TOTAL_AMOUNT: number | string;
  CREATED_AT: string;
  STATUS: string;
  ITEMS?: { ITEM_NAME: string; QUANTITY: number }[];
}

interface ProductForm {
  item_name: string;
  item_price: number;
  item_category: string;
  item_description: string;
  item_status: string;
}

const emptyForm = (): ProductForm => ({
  item_name: '',
  item_price: 0,
  item_category: '',
  item_description: '',
  item_status: 'Approved',
});

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

/** How many single-letter edits turn one word into the other. */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return row[b.length];
}

const CATEGORY_ICONS: Record<string, string> = {
  electronics: 'hardware-chip-outline',
  accessories: 'headset-outline',
  audio: 'headset-outline',
  wearables: 'watch-outline',
};

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonFooter,
    IonHeader,
    IonIcon,
    IonInput,
    IonLabel,
    IonModal,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToolbar,
    AdminRowSkeletonComponent,
  ],
})
export class AdminPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastController);
  private readonly alerts = inject(AlertController);
  private readonly session = inject(AdminSessionService);

  protected readonly itemFilters: ItemFilter[] = [
    'All',
    'Approved',
    'Pending',
    'Archived',
  ];
  protected readonly orderFilters: OrderFilter[] = [
    'All',
    'Pending',
    'Approved',
    'Cancelled',
  ];

  protected readonly photoPreview = signal<string | null>(null);
  protected readonly saving = signal(false);
  private photoData: string | null = null; // a new photo waiting to be uploaded
  private removePhoto = false;

  protected readonly tab = signal<AdminTab>('products');
  protected readonly query = signal('');
  protected readonly itemFilter = signal<ItemFilter>('All');
  protected readonly orderFilter = signal<OrderFilter>('All');

  protected readonly items = signal<AdminItem[]>([]);
  protected readonly orders = signal<AdminOrder[]>([]);

  protected readonly NEW_CATEGORY = '__new__';
  protected readonly categoryChoice = signal('');
  protected readonly newCategory = signal('');

  /** Every distinct category across all products, whatever their status. */
  protected readonly categories = computed(() => {
    const seen = new Map<string, string>();
    for (const item of this.items()) {
      const name = normalize(item.ITEM_CATEGORY ?? '');
      if (name && !seen.has(name.toLowerCase()))
        seen.set(name.toLowerCase(), name);
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  });

  /** Warns when a "new" category already exists or looks like a typo of one that does. */
  protected readonly categoryHint = computed(() => {
    if (this.categoryChoice() !== this.NEW_CATEGORY) return null;
    const typed = normalize(this.newCategory()).toLowerCase();
    if (!typed) return null;

    const exact = this.categories().find((c) => c.toLowerCase() === typed);
    if (exact) return { name: exact, exact: true };

    const limit = typed.length <= 5 ? 1 : 2;
    const close = this.categories().find(
      (c) => distance(typed, c.toLowerCase()) <= limit,
    );
    return close ? { name: close, exact: false } : null;
  });

  protected readonly itemsLoading = signal(true);
  protected readonly ordersLoading = signal(true);

  protected readonly isModalOpen = signal(false);
  protected readonly isEditing = signal(false);
  private readonly selectedItemId = signal<number | null>(null);

  /** Form model for the product modal. */
  protected currentProduct: ProductForm = emptyForm();

  protected readonly itemCounts = computed(() => {
    const list = this.items();
    const by = (s: string) => list.filter((i) => i.ITEM_STATUS === s).length;
    return {
      total: list.length,
      approved: by('Approved'),
      pending: by('Pending'),
      archived: by('Archived'),
    };
  });

  protected readonly orderCounts = computed(() => {
    const list = this.orders();
    const by = (s: string) => list.filter((o) => o.STATUS === s).length;
    return {
      total: list.length,
      pending: by('Pending'),
      approved: by('Approved'),
      cancelled: by('Cancelled'),
    };
  });

  protected readonly visibleItems = computed(() => {
    const q = this.query().trim().toLowerCase();
    const filter = this.itemFilter();
    return this.items().filter(
      (i) =>
        (filter === 'All' || i.ITEM_STATUS === filter) &&
        (!q ||
          `${i.ITEM_NAME} ${i.ITEM_CATEGORY ?? ''} ${i.ITEM_DESCRIPTION ?? ''}`
            .toLowerCase()
            .includes(q)),
    );
  });

  /** Newest first. */
  protected readonly visibleOrders = computed(() => {
    const q = this.query().trim().toLowerCase();
    const filter = this.orderFilter();
    return this.orders()
      .filter(
        (o) =>
          (filter === 'All' || o.STATUS === filter) &&
          (!q ||
            `${o.ORDER_ID} ${o.USER_NAME ?? ''} ${o.USER_EMAIL ?? ''}`
              .toLowerCase()
              .includes(q)),
      )
      .sort(
        (a, b) =>
          new Date(b.CREATED_AT).getTime() - new Date(a.CREATED_AT).getTime(),
      );
  });

  constructor() {
    addIcons({
      add,
      archiveOutline,
      checkmarkOutline,
      closeOutline,
      createOutline,
      cubeOutline,
      hardwareChipOutline,
      headsetOutline,
      logOutOutline,
      receiptOutline,
      trashOutline,
      watchOutline,
    });
  }

  ionViewWillEnter(): void {
    this.loadAllItems();
    this.loadOrders();
  }

  // ---------- view helpers ----------

  protected iconFor(category: string | null): string {
    return CATEGORY_ICONS[(category ?? '').toLowerCase()] ?? 'cube-outline';
  }

  protected pillClass(status: string): string {
    return `pill pill--${(status || 'pending').toLowerCase()}`;
  }

  protected orderSummary(order: AdminOrder): string {
    return (order.ITEMS ?? [])
      .map((line) => `${line.QUANTITY} × ${line.ITEM_NAME}`)
      .join(', ');
  }

  protected onTab(event: Event): void {
    this.tab.set((event as CustomEvent<{ value: AdminTab }>).detail.value);
    this.query.set('');
    this.itemFilter.set('All');
    this.orderFilter.set('All');
    if (this.tab() === 'orders') this.loadOrders();
    else this.loadAllItems();
  }

  protected onSearch(event: Event): void {
    this.query.set(
      (event as CustomEvent<{ value?: string | null }>).detail.value ?? '',
    );
  }

  protected onItemFilter(event: Event): void {
    this.itemFilter.set(
      (event as CustomEvent<{ value: ItemFilter }>).detail.value,
    );
  }

  protected onOrderFilter(event: Event): void {
    this.orderFilter.set(
      (event as CustomEvent<{ value: OrderFilter }>).detail.value,
    );
  }

  protected refresh(event: RefresherCustomEvent): void {
    const done = () => event.detail.complete();
    if (this.tab() === 'orders') this.loadOrders(done);
    else this.loadAllItems(done);
  }

  protected photoOf(item: AdminItem): string | null {
    return this.api.imageUrl(item.ITEM_IMAGE);
  }

  private resetPhoto(current: string | null ): void{
    this.photoPreview.set(current);
    this.photoData = null;
    this.removePhoto = false;
  }

  protected async onPhoto(event: Event): Promise<void>{
    const input = event.target as HTMLInputElement;
    const  file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      this.photoData = dataUrl;
      this.removePhoto = false;
      this.photoPreview.set(dataUrl);
    } catch (e: any) {
      this.presentToast(e?.message ?? 'Could not read that image.', 'danger');
    }
  }

  protected clearPhoto(): void{
    this.photoData = null;
    this.removePhoto = true;
    this.photoPreview.set(null);
  }

  private failSave(err: any, fallback: string): void{
    this.saving.set(false);
    this.presentToast(err?.error?.detail ?? fallback, 'danger');
  }

   private syncPhoto(itemId: number, message: string): void {
    const finish = (photoError?: string) => {
      this.saving.set(false);
      this.closeModal();
      this.loadAllItems();
      if (photoError) this.presentToast(`Product saved, but the photo failed: ${photoError}`, 'danger');
      else this.presentToast(message, 'success');
    };

    if (this.photoData) {
      this.api.uploadItemImage(itemId, this.photoData).subscribe({
        next: () => finish(),
        error: (err: any) => finish(err?.error?.detail ?? 'please try again.'),
      });
    } else if (this.removePhoto) {
      this.api.removeItemImage(itemId).subscribe({
        next: () => finish(),
        error: () => finish('it could not be removed.'),
      });
    } else {
      finish();
    }
  }
  // ---------- data ----------

  loadAllItems(done?: () => void): void {
    this.api.adminGetItems().subscribe({
      next: (res: any) => {
        this.items.set(res.items || []);
        this.itemsLoading.set(false);
        done?.();
      },
      error: (err: any) => {
        this.itemsLoading.set(false);
        this.onLoadError(err, done);
      },
    });
  }

  loadOrders(done?: () => void): void {
    this.api.getAdminOrders().subscribe({
      next: (res: any) => {
        this.orders.set(res.orders || []);
        this.ordersLoading.set(false);
        done?.();
      },
      error: (err: any) => {
        this.ordersLoading.set(false);
        this.onLoadError(err, done);
      },
    });
  }

  /** A 401 means the session is no longer valid, so send the admin back to sign in. */
  private onLoadError(err: any, done?: () => void): void {
    console.error('Request failed', err);
    if (err?.status === 401) this.logout();
    done?.();
  }

  // ---------- orders ----------

  updateOrderStatus(orderId: number, status: string): void {
    this.api.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.presentToast(`Order #${orderId} marked as ${status}`, 'success');
        this.loadOrders();
      },
      error: (err: any) => {
        this.presentToast(
          err?.error?.detail ?? 'Failed to update order status',
          'danger',
        );
        this.loadOrders();
      },
    });
  }

  async confirmCancelOrder(order: AdminOrder): Promise<void> {
    const alert = await this.alerts.create({
      header: 'Cancel this order?',
      message: `Order #${order.ORDER_ID} will be marked as cancelled.`,
      buttons: [
        { text: 'Keep order', role: 'cancel' },
        {
          text: 'Cancel order',
          role: 'destructive',
          handler: () => this.updateOrderStatus(order.ORDER_ID, 'Cancelled'),
        },
      ],
    });
    await alert.present();
  }

  // ---------- products ----------

  openAddModal(): void {
    this.isEditing.set(false);
    this.selectedItemId.set(null);
    this.currentProduct = emptyForm();
    this.categoryChoice.set(this.categories()[0] ?? this.NEW_CATEGORY);
    this.newCategory.set('');
    this.resetPhoto(null);
    this.isModalOpen.set(true);
  }

  openEditModal(item: AdminItem): void {
    this.isEditing.set(true);
    this.selectedItemId.set(item.ITEM_ID);
    this.currentProduct = {
      item_name: item.ITEM_NAME,
      item_price: Number(item.ITEM_PRICE),
      item_category: item.ITEM_CATEGORY ?? '',
      item_description: item.ITEM_DESCRIPTION ?? '',
      item_status: item.ITEM_STATUS || 'Approved',
    };
    const own = normalize(item.ITEM_CATEGORY ?? '').toLowerCase();
    this.categoryChoice.set(
      this.categories().find((c) => c.toLowerCase() === own) ??
        this.NEW_CATEGORY,
    );
    this.newCategory.set('');
    this.resetPhoto(this.photoOf(item));
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

    saveProduct(): void {
    if (this.saving()) return;

    const category = this.resolveCategory();
    const product: ProductForm = { ...this.currentProduct, item_category: category };
    if (!product.item_name.trim() || Number(product.item_price) <= 0) {
      this.presentToast('Please provide a valid name and price.', 'danger');
      return;
    }
    if (!category) {
      this.presentToast('Choose a category or type a new one.', 'danger');
      return;
    }

    this.saving.set(true);
    const id = this.selectedItemId();
    if (this.isEditing() && id !== null) {
      this.api.updateAdminItem(id, product).subscribe({
        next: () => this.syncPhoto(id, 'Product updated successfully!'),
        error: (err: any) => this.failSave(err, 'Failed to update product.'),
      });
    } else {
      this.api.addAdminItem(product).subscribe({
        next: (res: any) => this.syncPhoto(res.item_id, 'Product created successfully!'),
        error: (err: any) => this.failSave(err, 'Failed to create product.'),
      });
    }
  }

  /** Archives a product, or deletes it permanently if it is already archived. */
  async confirmRemove(item: AdminItem): Promise<void> {
    const archived = item.ITEM_STATUS === 'Archived';
    const alert = await this.alerts.create({
      header: archived ? 'Delete permanently?' : 'Archive product?',
      message: archived
        ? `"${item.ITEM_NAME}" will be deleted for good.`
        : `"${item.ITEM_NAME}" will be moved to the archive.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: archived ? 'Delete' : 'Archive',
          role: 'destructive',
          handler: () => this.remove(item),
        },
      ],
    });
    await alert.present();
  }

  private remove(item: AdminItem): void {
    const archived = item.ITEM_STATUS === 'Archived';
    this.api.deleteAdminItem(item.ITEM_ID).subscribe({
      next: () => {
        this.presentToast(
          `Product ${archived ? 'permanently deleted' : 'moved to archive'}.`,
          'success',
        );
        this.loadAllItems();
      },
      // Shows the server's reason, e.g. "part of past orders, leave it archived"
      error: (err: any) =>
        this.presentToast(
          err?.error?.detail ?? 'Failed to process request.',
          'danger',
        ),
    });
  }

  // ---------- misc ----------

  async presentToast(
    message: string,
    color: 'success' | 'danger',
  ): Promise<void> {
    const toast = await this.toasts.create({
      message,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }

  logout(): void {
    this.session.end();
    this.router.navigateByUrl('/admin-auth', { replaceUrl: true });
  }

  protected useCategory(name: string): void {
    this.categoryChoice.set(name);
    this.newCategory.set('');
  }

  private resolveCategory(): string {
    const raw =
      this.categoryChoice() === this.NEW_CATEGORY
        ? this.newCategory()
        : this.categoryChoice();
    const name = normalize(raw);
    return (
      this.categories().find((c) => c.toLowerCase() === name.toLowerCase()) ??
      name
    );
  }
}
