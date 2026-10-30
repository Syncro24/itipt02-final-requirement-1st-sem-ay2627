import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
