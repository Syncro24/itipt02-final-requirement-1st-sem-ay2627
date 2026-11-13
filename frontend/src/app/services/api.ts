import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Body for creating or updating a product. */
export interface ItemPayload {
  item_name: string;
  item_price: number;
  item_category: string;
  item_description: string;
  item_status: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  getItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items`);
  }

  getUserProfile(userId: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/accounts/${userId}`);
  }

  updateUserProfile(userId: number = 1, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/accounts/${userId}`, data);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  signup(data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  getCart(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart/${userId}`);
  }

  addToCart(payload: {
    user_id: number;
    item_id: number;
    quantity: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart`, payload);
  }

  updateCartQuantity(cartItemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cart/${cartItemId}`, { quantity });
  }

  removeCartItem(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${cartItemId}`);
  }

  addAdminItem(itemData: ItemPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, itemData);
  }

  updateAdminItem(itemId: number, itemData: ItemPayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/items/${itemId}`, itemData);
  }

  deleteAdminItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${itemId}`);
  }

  getAdminOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/orders`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/orders/${orderId}/status`, {
      status,
    });
  }

  adminLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/login`, {
      email,
      password,
    });
  }

  adminGetItems(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/items`);
  }

  getUserOrders(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${userId}`);
  }

  placeOrder(payload: {
    user_id: number;
    cart_item_ids?: number[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, payload);
  }

  cancelMyOrder(orderId: number, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/${orderId}/cancel`, {
      user_id: userId,
    });
  }

  uploadItemImage(itemId: number, image: string): Observable<any>{
    return this.http.post(`${this.apiUrl}/items/${itemId}/image`, {image});
  }

  removeItemImage(itemId: number): Observable<any>{
    return this.http.delete(`${this.apiUrl}/items/${itemId}/image`);
  }

  imageUrl(name: string | null | undefined): string | null {
    return !name || /^default/i.test(name) ? null : `${this.apiUrl}/uploads/${encodeURIComponent(name)}`;
  }
}
