import { Component } from '@angular/core';
import { IonSkeletonText } from '@ionic/angular';

const BASE = `
  :host { display: block; }
  ion-skeleton-text { margin: 0; }
`;

/** Placeholder for a product card on the shop search page. */
@Component({
  selector: 'app-product-skeleton',
  imports: [IonSkeletonText],
  template: `
    <div class="card" aria-hidden="true">
      <ion-skeleton-text class="thumb" [animated]="true"></ion-skeleton-text>
      <ion-skeleton-text class="tag" [animated]="true"></ion-skeleton-text>
      <ion-skeleton-text class="title" [animated]="true"></ion-skeleton-text>
      <ion-skeleton-text class="line" [animated]="true"></ion-skeleton-text>
      <ion-skeleton-text class="line short" [animated]="true"></ion-skeleton-text>
      <div class="foot">
        <ion-skeleton-text class="price" [animated]="true"></ion-skeleton-text>
        <ion-skeleton-text class="btn" [animated]="true"></ion-skeleton-text>
      </div>
    </div>
  `,
  styles: [
    BASE +
      `
    .card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 100%;
      padding: 8px 8px 12px;
      border: 1px solid var(--ion-border-color, rgba(128, 128, 128, 0.18));
      border-radius: var(--radius-card, 20px);
      background: var(--ion-item-background, var(--ion-card-background, #fff));
    }
    .thumb { width: 100%; aspect-ratio: 16 / 10; border-radius: 14px; }
    .tag { width: 72px; height: 20px; margin: 6px 8px 0; border-radius: 999px; }
    .title { width: 70%; height: 18px; margin: 2px 8px 0; border-radius: 9px; }
    .line { width: calc(100% - 16px); height: 12px; margin: 0 8px; border-radius: 6px; }
    .short { width: 55%; }
    .foot { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding: 6px 4px 0 8px; }
    .price { width: 80px; height: 22px; border-radius: 11px; }
    .btn { width: 96px; height: 36px; border-radius: 999px; }
  `,
  ],
})
export class ProductSkeletonComponent {}

/** Placeholder for an order card on the Account page. */
@Component({
  selector: 'app-order-skeleton',
  imports: [IonSkeletonText],
  template: `
    <div class="card" aria-hidden="true">
      <div class="top">
        <div>
          <ion-skeleton-text class="title" [animated]="true"></ion-skeleton-text>
          <ion-skeleton-text class="date" [animated]="true"></ion-skeleton-text>
        </div>
        <ion-skeleton-text class="pill" [animated]="true"></ion-skeleton-text>
      </div>
      <ion-skeleton-text class="items" [animated]="true"></ion-skeleton-text>
      <div class="bottom">
        <ion-skeleton-text class="note" [animated]="true"></ion-skeleton-text>
        <ion-skeleton-text class="total" [animated]="true"></ion-skeleton-text>
      </div>
    </div>
  `,
  styles: [
    BASE +
      `
    .card {
      padding: 14px 16px;
      border-radius: 16px;
      background: var(--ion-item-background, var(--ion-card-background, #fff));
    }
    .top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .title { width: 110px; height: 16px; border-radius: 8px; }
    .date { width: 130px; height: 12px; margin-top: 8px; border-radius: 6px; }
    .pill { width: 72px; height: 22px; border-radius: 999px; }
    .items { width: 85%; height: 12px; margin-top: 14px; border-radius: 6px; }
    .bottom {
      display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding-top: 12px;
      border-top: 1px solid var(--ion-border-color, rgba(128, 128, 128, 0.2));
    }
    .note { width: 150px; height: 12px; border-radius: 6px; }
    .total { width: 70px; height: 18px; border-radius: 9px; }
  `,
  ],
})
export class OrderSkeletonComponent {}

/** Placeholder for a cart row. */
@Component({
  selector: 'app-cart-skeleton',
  imports: [IonSkeletonText],
  template: `
    <div class="item" aria-hidden="true">
      <ion-skeleton-text class="check" [animated]="true"></ion-skeleton-text>
      <ion-skeleton-text class="thumb" [animated]="true"></ion-skeleton-text>
      <div class="body">
        <ion-skeleton-text class="name" [animated]="true"></ion-skeleton-text>
        <ion-skeleton-text class="each" [animated]="true"></ion-skeleton-text>
        <ion-skeleton-text class="stepper" [animated]="true"></ion-skeleton-text>
      </div>
      <div class="side">
        <ion-skeleton-text class="trash" [animated]="true"></ion-skeleton-text>
        <ion-skeleton-text class="total" [animated]="true"></ion-skeleton-text>
      </div>
    </div>
  `,
  styles: [
    BASE +
      `
    .item {
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border: 1px solid var(--ion-border-color, rgba(128, 128, 128, 0.18));
      border-radius: var(--radius-card, 20px);
      background: var(--ion-item-background, var(--ion-card-background, #fff));
    }
    .check { width: 22px; height: 22px; border-radius: 6px; }
    .thumb { width: 64px; height: 64px; border-radius: 16px; }
    .name { width: 60%; height: 16px; border-radius: 8px; }
    .each { width: 35%; height: 12px; margin: 8px 0 12px; border-radius: 6px; }
    .stepper { width: 104px; height: 32px; border-radius: 999px; }
    .side { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; align-self: stretch; min-height: 64px; }
    .trash { width: 24px; height: 24px; border-radius: 8px; }
    .total { width: 72px; height: 18px; border-radius: 9px; }
  `,
  ],
})
export class CartSkeletonComponent {}

/** Placeholder for a row in the admin lists. */
@Component({
  selector: 'app-admin-row-skeleton',
  imports: [IonSkeletonText],
  template: `
    <div class="row" aria-hidden="true">
      <ion-skeleton-text class="tile" [animated]="true"></ion-skeleton-text>
      <div class="info">
        <ion-skeleton-text class="name" [animated]="true"></ion-skeleton-text>
        <ion-skeleton-text class="sub" [animated]="true"></ion-skeleton-text>
        <ion-skeleton-text class="pill" [animated]="true"></ion-skeleton-text>
      </div>
      <div class="end">
        <ion-skeleton-text class="price" [animated]="true"></ion-skeleton-text>
        <ion-skeleton-text class="actions" [animated]="true"></ion-skeleton-text>
      </div>
    </div>
  `,
  styles: [
    BASE +
      `
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 16px;
      background: var(--ion-item-background, var(--ion-card-background, #fff));
    }
    .tile { flex: none; width: 44px; height: 44px; border-radius: 12px; }
    .info { flex: 1; min-width: 0; }
    .name { width: 55%; height: 16px; border-radius: 8px; }
    .sub { width: 30%; height: 12px; margin: 8px 0; border-radius: 6px; }
    .pill { width: 64px; height: 18px; border-radius: 999px; }
    .end { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
    .price { width: 80px; height: 18px; border-radius: 9px; }
    .actions { width: 56px; height: 24px; border-radius: 8px; }
  `,
  ],
})
export class AdminRowSkeletonComponent {}