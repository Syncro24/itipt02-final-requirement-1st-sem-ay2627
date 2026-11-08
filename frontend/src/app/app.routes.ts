import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () => import('./shop/tab/tab.page').then((m) => m.TabPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./shop/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'search',
        loadComponent: () => import('./shop/search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'cart',
        loadComponent: () => import('./shop/cart/cart.page').then((m) => m.CartPage),
      },
      {
        path: 'account',
        loadComponent: () => import('./shop/account/account.page').then((m) => m.AccountPage),
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.page').then( m => m.AuthPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then( m => m.AdminPage)
  },
  {
    path: 'admin-auth',
    loadComponent: () => import('./admin-auth/admin-auth.page').then( m => m.AdminAuthPage)
  },
];